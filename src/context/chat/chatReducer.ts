import { ChatState } from './';

type ChatAction = { type: ChatActionType.setIsLoading; payload: boolean };

export enum ChatActionType {
  setIsLoading = '[CHAT] - Set isLoading state',
}

export const chatReducer = (
  state: ChatState,
  action: ChatAction
): ChatState => {
  switch (action.type) {
    case ChatActionType.setIsLoading:
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
};
