'use client';

import { Send } from 'lucide-react';
import { useRef } from 'react';

import { useChat } from '@/context';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';

export type ChatInputProps = { isDisabled?: boolean };

const ChatInput: React.FC<ChatInputProps> = ({ isDisabled }) => {
  const { addMessage, handleInputChange, isLoading, message } = useChat();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onSendMessage = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addMessage();

      textareaRef.current?.focus(); // set focus on input anfter send message
    }
  };
  const onClickSendMessage = () => {
    addMessage();
    textareaRef.current?.focus();
  };

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                rows={1}
                maxRows={4}
                autoFocus
                ref={textareaRef}
                onKeyUp={onSendMessage}
                onChange={handleInputChange}
                value={message}
                placeholder="Enter yout question..."
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
              />

              <Button
                aria-label="send message"
                className="absolute bottom-1.5 right-[8px]"
                disabled={isLoading || isDisabled}
                type="submit"
                onClick={onClickSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
