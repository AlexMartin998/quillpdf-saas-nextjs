import { ChatState } from './';

type ChatAction =
  | { type: ChatActionType.setIsLoading; payload: boolean }
  | { type: ChatActionType.setMessage; payload: string };

export enum ChatActionType {
  setIsLoading = '[CHAT] - Set isLoading state',
  setMessage = '[CHAT] - Set message',
}

export const chatReducer = (
  state: ChatState,
  action: ChatAction
): ChatState => {
  switch (action.type) {
    case ChatActionType.setIsLoading:
      return { ...state, isLoading: action.payload };

    case ChatActionType.setMessage:
      return { ...state, message: action.payload };

    default:
      return state;
  }
};
