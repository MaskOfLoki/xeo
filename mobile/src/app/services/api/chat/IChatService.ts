import { IXCChatMessage } from '../../../../../../common/types/IXCChatMessage';

export interface IChatService {
  sendMessage(message: string, namespace?: string): Promise<void>;
  watch(callback: (value: IXCChatMessage) => void, namespace?: string): Promise<VoidFunction>;
  getMessageHistory(namespace?: string): Promise<IXCChatMessage[]>;
}
