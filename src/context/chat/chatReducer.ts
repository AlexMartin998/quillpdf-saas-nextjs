import { ChatState } from './';
	 
type ChatAction = { type: ChatActionType.actionName };

export enum ChatActionType {
	actionName = '[Chat] - ActionName',
}

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
	switch (action.type) {
		case ChatActionType.actionName:
			return { ...state };

		default:
			return state;
	}
};