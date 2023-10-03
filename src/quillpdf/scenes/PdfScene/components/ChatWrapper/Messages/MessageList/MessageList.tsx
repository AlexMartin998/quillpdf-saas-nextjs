'use client';

import { useIntersection } from '@mantine/hooks';
import { useEffect, useRef } from 'react';

import { CombinedMessages } from '@/shared/types';
import { Message } from '..';

export type MessageListProps = {
  combinedMessages: CombinedMessages;
  fetchNextPage: any;
};

const MessageList: React.FC<MessageListProps> = ({
  combinedMessages,
  fetchNextPage,
}) => {
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const { ref, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  return (
    <>
      {combinedMessages.map((message, i) => {
        const isNextMessageSamePerson =
          combinedMessages[i - 1]?.isUserMessage ===
          combinedMessages[i]?.isUserMessage;

        if (i === combinedMessages.length - 1)
          return (
            <Message
              ref={ref}
              message={message}
              isNextMessageSamePerson={isNextMessageSamePerson}
              key={message.id}
            />
          );
        else
          return (
            <Message
              ref={ref}
              message={message}
              isNextMessageSamePerson={isNextMessageSamePerson}
              key={message.id}
            />
          );
      })}
    </>
  );
};

export default MessageList;
