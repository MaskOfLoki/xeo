import { IChatService } from './IChatService';
import { IXCChatMessage } from '../../../../../../common/types/IXCChatMessage';
import { gcBackend } from '@gamechangerinteractive/xc-backend';
import { GAME_ID, IUser } from '../../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { IWorkerAPIService } from '../IWorkerAPIService';
import { proxy } from 'comlink';

export class WorkerChatService implements IChatService {
  constructor(private _channel: string, private _worker: IWorkerAPIService) {}

  public async getMessageHistory(namespace?: string): Promise<IXCChatMessage[]> {
    const channel: string = this.getPubnubChannel(namespace);
    const { channels } = await gcBackend.pubnub.client.fetchMessages({
      channels: [channel],
      count: 250,
    });

    const messages = channels[channel] ?? [];
    return messages.map((item) => item.message);
  }

  public async sendMessage(message: string, namespace?: string): Promise<void> {
    const chatMessage: IXCChatMessage = {
      username: gcBackend.auth.username,
      uid: gcBackend.auth.uid,
      timestamp: await this._worker.time(),
      message,
    };

    const user = gcBackend.auth.user as IUser;

    if (!isEmptyString(user.avatarUrl)) {
      chatMessage.avatarUrl = user.avatarUrl;
    } else {
      chatMessage.avatarId = user.avatar;
    }

    return gcBackend.pubnub.publish({
      channel: this.getPubnubChannel(namespace),
      message: chatMessage,
    });
  }

  public watch(callback: (value: IXCChatMessage) => void, namespace?: string): Promise<VoidFunction> {
    const unwatch = gcBackend.pubnub.subscribe(
      {
        channel: this.getPubnubChannel(namespace),
      },
      (message: IXCChatMessage) => callback(message),
    );

    return Promise.resolve(proxy(() => unwatch()));
  }

  private getPubnubChannel(namespace: string): string {
    let channel = `${gcBackend.cid}-${GAME_ID}-${this._channel}chat`;

    if (!isEmptyString(namespace)) {
      channel += `-${namespace}`;
    }

    return channel;
  }
}
