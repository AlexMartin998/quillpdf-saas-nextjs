import { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from '../trpc';

// // get tRPC types. If output changes, it will be updeated inmediately
type RouterOutput = inferRouterOutputs<AppRouter>;
type Messages = RouterOutput['getFileMessages']['messages'];

type OmitText = Omit<Messages[number], 'text'>;

type ExtendedText = {
  text: string | JSX.Element;
};

export type ExtendedMessage = OmitText & ExtendedText;

type Message = Messages[number] | ExtendedMessage;

export type CombinedMessages = Message[];
