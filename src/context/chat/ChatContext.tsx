import { createContext } from 'react';

type ChatContextProps = {
  message: string;
  isLoading: boolean;

  addMessage: () => void;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export const ChatContext = createContext({} as ChatContextProps);
