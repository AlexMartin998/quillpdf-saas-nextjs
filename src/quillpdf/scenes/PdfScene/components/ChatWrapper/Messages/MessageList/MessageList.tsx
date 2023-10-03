import { CombinedMessages } from '@/shared/types';
import { Message } from '..';

export type MessageListProps = { combinedMessages: CombinedMessages };

const MessageList: React.FC<MessageListProps> = ({ combinedMessages }) => {
  return (
    <>
      {combinedMessages.map((message, i) => {
        const isNextMessageSamePerson =
          combinedMessages[i - 1]?.isUserMessage ===
          combinedMessages[i]?.isUserMessage;

        if (i === combinedMessages.length - 1)
          return (
            <Message
              message={message}
              isNextMessageSamePerson={isNextMessageSamePerson}
              key={message.id}
            />
          );
        else
          return (
            <Message
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
