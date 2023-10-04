import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

import { db } from '@/db';
import { PineconeConstants } from '@/shared/constants';
import { getPineconeClient } from '@/shared/lib/pinecone';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: '4MB' } })
    // This code runs on your server before upload
    .middleware(async ({ req }) => {
      // auth
      const { getUser } = getKindeServerSession();
      const user = getUser();
      if (!user || !user.id) throw new Error('Unauthorized');

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: 'PROCESSING',
        },
      });

      // // // indexing file for AI propouses
      try {
        const res = await fetch(
          `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
        );
        const blob = await res.blob();

        //
        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load(); // pdf content
        const pagesAmt = pageLevelDocs.length; // to check subscription (pro/free plan)

        // // vectorize and index entire document
        const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.Index(PineconeConstants.IndexName);
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        }); // reuse generated vector from text (pdf content)

        // save vector: it'll save 1 vector per page
        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          // namespace: createdFile.id, // starter plans do not work with it
        });

        await db.file.update({
          data: {
            uploadStatus: 'SUCCESS',
          },
          where: {
            id: createdFile.id,
          },
        });
      } catch (error) {
        console.log(error);
        await db.file.update({
          data: {
            uploadStatus: 'FAILED',
          },
          where: {
            id: createdFile.id,
          },
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
