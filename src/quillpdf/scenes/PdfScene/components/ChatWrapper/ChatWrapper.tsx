'use client';

import { trpc } from '@/app/_trpc/client';
import {
  ChatInput,
  ChatWrapperLoader,
  InvalidPDFProcessingMsg,
  Messages,
} from '..';

export type ChatWrapperProps = { fileId: string };

const ChatWrapper: React.FC<ChatWrapperProps> = ({ fileId }) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: data =>
        data?.status === 'SUCCESS' || data?.status === 'FAILED' ? false : 750,
    }
  );

  if (isLoading)
    return (
      <ChatWrapperLoader
        message="Loading..."
        description="We're preparing your PDF."
      />
    );
  if (data?.status === 'PROCESSING')
    return (
      <ChatWrapperLoader
        message="Processing PDF..."
        description="This won't take long."
      />
    );
  if (data?.status === 'FAILED') return <InvalidPDFProcessingMsg />;

  return (
    <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
      <div className="flex-1 justify-between flex flex-col mb-28">
        <Messages fileId={'s'} />
      </div>

      <ChatInput isDisabled />
    </div>
  );
};

export default ChatWrapper;
