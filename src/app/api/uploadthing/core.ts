import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

import { PLANS } from '@/config';
import { db } from '@/db';
import { PineconeConstants } from '@/shared/constants';
import { getPineconeClient } from '@/shared/lib/pinecone';
import { getUserSubscriptionPlan } from '@/shared/lib/stripe';

const f = createUploadthing();

const middleware = async () => {
  // auth
  const { getUser } = getKindeServerSession();
  const user = getUser();
  if (!user || !user.id) throw new Error('Unauthorized');

  // stripe subscription
  const subscriptionPlan = await getUserSubscriptionPlan();

  return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  // return if it already exists
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key,
    },
  });
  if (isFileExist) return;

  // // // Create File
  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: `${process.env.UPLOADTHING_URL}/${file.key}`,
      uploadStatus: 'PROCESSING',
    },
  });

  // // // Indexing file for AI propouses
  try {
    const res = await fetch(`${process.env.UPLOADTHING_URL}/${file.key}`);
    const blob = await res.blob();

    const loader = new PDFLoader(blob);
    const pageLevelDocs = await loader.load(); // pdf content

    // // // Subscription logic
    const pagesAmt = pageLevelDocs.length; // to check subscription (pro/free plan)
    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;
    const isProExceeded =
      pagesAmt > PLANS.find(plan => plan.name === 'Pro')!.pagesPerPdf;
    const isFreeExceeded =
      pagesAmt > PLANS.find(plan => plan.name === 'Free')!.pagesPerPdf;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: 'FAILED',
        },
        where: {
          id: createdFile.id,
        },
      });
    }

    // // // vectorize and index entire document
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
};

// // // FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: '4MB' } })
    // This code runs on your server before upload
    .middleware(middleware)
    // This code RUNS ON YOUR SERVER after upload
    .onUploadComplete(onUploadComplete),

  proPlanUploader: f({ pdf: { maxFileSize: '16MB' } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
