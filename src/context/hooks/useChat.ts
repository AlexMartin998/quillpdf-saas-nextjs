import { useContext } from 'react';

import { ChatContext } from '../chat';

export const useChat = () => useContext(ChatContext);
