import { openAI } from '@/shared/lib/openai';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { NextRequest } from 'next/server';

import { db } from '@/db';
import { PineconeConstants } from '@/shared/constants';
import { getPineconeClient } from '@/shared/lib/pinecone';
import { SendMessageValidator } from '@/shared/lib/validators';

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = getUser();
  const { id: userId } = user;
  if (!userId) return new Response('Unauthorized', { status: 401 });

  // validate req body with zod. If it not is correct, throws an error
  const { fileId, message } = SendMessageValidator.parse(body);

  // get user file to set chat messages
  const file = await db.file.findFirst({ where: { id: fileId, userId } });
  if (!file) return new Response('Not found', { status: 404 });

  // create user message
  await db.message.create({
    data: { text: message, isUserMessage: true, userId, fileId },
  });

  // // // AI behavior
  // // vectorize message
  const pinecone = await getPineconeClient();
  const pineconeIndex = pinecone.Index(PineconeConstants.IndexName);
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  }); // reuse generated vector from text (pdf content)

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });

  const results = await vectorStore.similaritySearch(message, 4); // 4 closest results

  // history messages if the user reffers to and previous message/response
  const prevMessages = await db.message.findMany({
    where: { fileId },
    orderBy: { createdAt: 'asc' },
    take: 6,
  });

  // send to OpenAI to answer that message
  const formattedPrevMessages = prevMessages.map(msg => ({
    role: msg.isUserMessage ? ('user' as const) : ('assistant' as const),
    content: msg.text,
  }));

  const response = await openAI.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    stream: true, // stream back this response to the Client Side in real time

    //
    messages: [
      {
        role: 'system',
        content:
          'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
      },
      {
        role: 'user',
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map(message => {
          if (message.role === 'user') return `User: ${message.content}\n`;
          return `Assistant: ${message.content}\n`;
        })}
        
        \n----------------\n
        
        CONTEXT:
        ${results.map(r => r.pageContent).join('\n\n')}
        
        USER INPUT: ${message}`,
      },
    ],
  });

  // // return back answer as a real time stream
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
};
