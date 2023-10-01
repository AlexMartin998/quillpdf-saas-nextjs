import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest } from 'next/server';

import { db } from '@/db';
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
};
