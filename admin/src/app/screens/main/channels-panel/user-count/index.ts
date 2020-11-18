import { ClassComponent, Vnode, redraw } from 'mithril';
import { template } from './template';
import { IChannel } from '../../../../../../../common/common';
import { api } from '../../../../services/api';

export interface IUserCountAttrs {
  channels: IChannel[];
  channel: IChannel;
  onsave: (value: IChannel) => void;
}

export class UserCount implements ClassComponent<IUserCountAttrs> {
  private _channels: IChannel[] = [];
  private _channel: IChannel;
  private _timer: number;
  private _isStarted: boolean;

  public userCount: number;

  private async refresh() {
    clearTimeout(this._timer);

    if (!this._channel?.showUserCount || !this._isStarted) {
      return;
    }

    // TODO: probably we need to show online users only for selected channel
    const result = await Promise.all(this._channels.filter((ch) => !ch.deleted).map((ch) => api.getOnlineUsers(ch.id)));

    if (!this._channel?.showUserCount || !this._isStarted) {
      return;
    }

    const sum = result.reduce((p1, p2) => p1 + p2, 0);

    if (sum !== this.userCount) {
      this.userCount = sum;
      redraw();
    }

    this._timer = window.setTimeout(this.refresh.bind(this), 2000);
  }

  public onremove() {
    this._isStarted = false;
    clearTimeout(this._timer);
  }

  public view({ attrs }: Vnode<IUserCountAttrs>) {
    this._channels = attrs.channels;
    this._channel = attrs.channel;

    if (this._channel?.showUserCount) {
      if (!this._isStarted) {
        this._isStarted = true;
        this.refresh();
      }
    } else {
      clearTimeout(this._timer);
      this._isStarted = false;
    }

    return template.call(this, attrs);
  }
}
