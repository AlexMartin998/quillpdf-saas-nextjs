'use client';

import { Loader2 } from 'lucide-react';

import { ChatInput } from '../..';

export type ChatWrapperLoaderProps = { message: string; description: string };

const ChatWrapperLoader: React.FC<ChatWrapperLoaderProps> = ({
  message,
  description,
}) => {
  return (
    <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2 pt-16 md:pt-0">
      <div className="flex-1 flex justify-center items-center flex-col mb-28">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <h3 className="font-semibold text-xl">{message}</h3>
          <p className="text-zinc-500 text-sm">{description}</p>
        </div>
      </div>

      <ChatInput isDisabled />
    </div>
  );
};

export default ChatWrapperLoader;
