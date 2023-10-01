import { useReducer } from 'react';

import { ChatContext, chatReducer } from './';

export type ChatState = {
  message: string;
  isLoading: boolean;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

const Chat_INIT_STATE: ChatState = {
  message: '',
  isLoading: false,
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [state, dispatch] = useReducer(chatReducer, Chat_INIT_STATE);

  const addMessage = () => {};

  const handleInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {};

  return (
    <ChatContext.Provider value={{ ...state, addMessage, handleInputChange }}>
      {children}
    </ChatContext.Provider>
  );
};
