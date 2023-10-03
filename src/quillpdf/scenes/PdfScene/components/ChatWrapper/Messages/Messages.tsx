'use client';

import { Loader2, MessageSquare } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';

import { trpc } from '@/app/_trpc/client';
import { useChat } from '@/context';
import { MessagesConstants } from '@/shared/constants';
import { CombinedMessages } from '@/shared/types';
import { MessageList } from '.';

export type MessagesProps = { fileId: string };

const Messages: React.FC<MessagesProps> = ({ fileId }) => {
  const { isLoading: isAiThinking } = useChat();

  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: MessagesConstants.InfiniteQueryLimit,
      },
      {
        getNextPageParam: lastPage => lastPage?.nextCursor,
        keepPreviousData: true, // keep prev messages
      }
    );

  const messages = data?.pages.flatMap(page => page.messages);

  // // for loading & display messages
  const loadingMessageUI = {
    createdAt: new Date().toISOString(),
    id: 'loading-message',
    isUserMessage: false,
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    ),
  };

  const combinedMessages: CombinedMessages = [
    ...(isAiThinking ? [loadingMessageUI] : []),
    ...(messages ?? []),
  ];

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      {!!combinedMessages?.length ? (
        <MessageList
          combinedMessages={combinedMessages}
          fetchNextPage={fetchNextPage}
        />
      ) : isLoading ? (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
