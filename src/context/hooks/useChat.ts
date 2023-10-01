import { useContext } from 'react';

import { ChatContext } from '../chat';

export const useAuth = () => useContext(ChatContext);
