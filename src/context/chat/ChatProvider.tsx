import { useMutation } from '@tanstack/react-query';
import { useReducer } from 'react';

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

  // fetch
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      if (!message.trim()) return;

      const res = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({ fileId, message }),
      });
      if (!res.ok) throw new Error('Failed to send message');

      dispatch({ type: ChatActionType.setIsLoading, payload: false });
      return res;
    },
  });

  //

  const addMessage = () => {
    dispatch({ type: ChatActionType.setIsLoading, payload: true });
    sendMessage({ message: state.message });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const message = e.target.value;

    dispatch({
      type: ChatActionType.setMessage,
      payload: message,
    });
  };

  return (
    <ChatContext.Provider value={{ ...state, addMessage, handleInputChange }}>
      {children}
    </ChatContext.Provider>
  );
};
