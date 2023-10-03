import { useMutation } from '@tanstack/react-query';
import { useReducer, useRef } from 'react';

import { trpc } from '@/app/_trpc/client';
import { toast } from '@/shared/components/ui/use-toast';
import { MessagesConstants } from '@/shared/constants';
import { ChatActionType, ChatContext, chatReducer } from './';

export type ChatState = {
  message: string;
  isLoading: boolean;
  currentFileId: string;
};

interface ChatProviderProps {
  children: React.ReactNode;
  fileId: string;
}

const CHAT_INIT_STATE: ChatState = {
  message: '',
  currentFileId: '',
  isLoading: false,
};

export const ChatProvider = ({ children, fileId }: ChatProviderProps) => {
  const [state, dispatch] = useReducer(chatReducer, CHAT_INIT_STATE);

  // optimistic upd
  const utils = trpc.useContext();
  const backupMessage = useRef('');

  // fetch
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      if (!message.trim()) return;

      // console.log(message);
      // return;

      const res = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({ fileId, message }),
      });
      if (!res.ok) throw new Error('Failed to send message');

      return res.body;
    },

    // // on mutate - after send message in UI
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      dispatch({ type: ChatActionType.setMessage, payload: '' });

      // // upd ui with messages without saving messages in Context
      await utils.getFileMessages.cancel();
      const previousMessages = utils.getFileMessages.getInfiniteData();

      utils.getFileMessages.setInfiniteData(
        {
          fileId,
          limit: MessagesConstants.InfiniteQueryLimit,
        },
        old => {
          if (!old) {
            return {
              // react query spects this obj for infiniteQuery
              pages: [],
              pageParams: [],
            };
          }

          let newPages = [...old.pages];
          let latestPage = newPages[0]!;

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ];

          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      // return prev msgs to be rendered
      dispatch({ type: ChatActionType.setIsLoading, payload: true });
      return {
        previousMessages:
          previousMessages?.pages.flatMap(page => page.messages) ?? [],
      };
    },

    // // on success: Real time Stream
    onSuccess: async stream => {
      dispatch({ type: ChatActionType.setIsLoading, payload: false });

      if (!stream) {
        return toast({
          title: 'There was a problem sending this message',
          description: 'Please refresh this page and try again',
          variant: 'destructive',
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // accumulated response
      let accResponse = '';
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        // append chunk to the actual message
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: MessagesConstants.InfiniteQueryLimit },
          old => {
            if (!old) return { pages: [], pageParams: [] };

            let isAiResponseCreated = old.pages.some(page =>
              page.messages.some(message => message.id === 'ai-response')
            );

            let updatedPages = old.pages.map(page => {
              if (page === old.pages[0]) {
                let updatedMessages;

                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: 'ai-response',
                      text: accResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessages = page.messages.map(message => {
                    if (message.id === 'ai-response') {
                      return {
                        ...message,
                        text: accResponse,
                      };
                    }
                    return message;
                  });
                }

                return {
                  ...page,
                  messages: updatedMessages,
                };
              }

              return page;
            });

            return { ...old, pages: updatedPages };
          }
        );
      }
    },

    // // on error
    onError: (_, __, context) => {
      dispatch({
        type: ChatActionType.setMessage,
        payload: backupMessage.current,
      });
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
    },

    // like finally in try/catch
    onSettled: async () => {
      dispatch({ type: ChatActionType.setIsLoading, payload: false });
      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  //

  const addMessage = () => {
    sendMessage({ message: state.message });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const message = e.target.value;

    dispatch({ type: ChatActionType.setMessage, payload: message });
  };

  return (
    <ChatContext.Provider value={{ ...state, addMessage, handleInputChange }}>
      {children}
    </ChatContext.Provider>
  );
};
