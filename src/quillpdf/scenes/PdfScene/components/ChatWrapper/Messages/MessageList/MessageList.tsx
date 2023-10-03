import { CombinedMessages } from '@/shared/types';

export type MessageListProps = { combinedMessages: CombinedMessages };

const MessageList: React.FC<MessageListProps> = ({ combinedMessages }) => {
  return (
    <>
      {combinedMessages.map((message, i) => {
        const isNextMessageSamePerson =
          combinedMessages[i - 1]?.isUserMessage ===
          combinedMessages[i]?.isUserMessage;

        return <div key={message.id}>{message.text}</div>;
      })}
    </>
  );
};

export default MessageList;
