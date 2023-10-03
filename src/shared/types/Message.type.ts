type Message =
  | {
      text: string;
      id: string;
      createdAt: string;
      isUserMessage: boolean;
    }
  | {
      text: JSX.Element;
      createdAt: string;
      id: string;
      isUserMessage: boolean;
    };

export type CombinedMessages = Message[];
