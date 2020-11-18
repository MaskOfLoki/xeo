import { IChatService } from './IChatService';
import { loading } from '../../../../../../common/loading';
import { IXCChatMessage } from '../../../../../../common/types/IXCChatMessage';
import { proxy } from 'comlink';

export class APIChatService implements IChatService {
  constructor(private _chat: IChatService) {}

  public getMessageHistory(namespace?: string): Promise<IXCChatMessage[]> {
    return loading.wrap(this._chat.getMessageHistory(namespace));
  }

  public sendMessage(message: string, namespace?: string): Promise<void> {
    return loading.wrap(this._chat.sendMessage(message, namespace));
  }

  public watch(callback: (value: IXCChatMessage) => void, namespace?: string): Promise<VoidFunction> {
    return this._chat.watch(
      proxy((value) => callback(value)),
      namespace,
    );
  }
}
