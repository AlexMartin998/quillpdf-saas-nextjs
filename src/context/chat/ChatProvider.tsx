import { useReducer } from 'react';

import { useMutation } from '@tanstack/react-query';
import { ChatActionType, ChatContext, chatReducer } from './';

export type ChatState = {
  message: string;
  isLoading: boolean;
  currentFileId: string;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

const CHAT_INIT_STATE: ChatState = {
  message: '',
  currentFileId: '',
  isLoading: false,
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [state, dispatch] = useReducer(chatReducer, CHAT_INIT_STATE);

  // fetch
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const res = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({ fileId: state.currentFileId, message }),
      });
      if (!res.ok) throw new Error('Failed to send message');

      dispatch({ type: ChatActionType.setIsLoading, payload: false });
      return res;
    },
  });

  //

  const addMessage = (message: string) => {
    dispatch({ type: ChatActionType.setIsLoading, payload: true });
    sendMessage({ message });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    //
  };

  return (
    <ChatContext.Provider value={{ ...state, addMessage, handleInputChange }}>
      {children}
    </ChatContext.Provider>
  );
};
