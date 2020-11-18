import { ClassComponent, VnodeDOM, redraw } from 'mithril';
import { Unsubscribable } from 'rxjs';
import { IState } from '../../../../../common/common';
import { api } from '../../services/api';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { isRTMPStream } from '../../../../../common/utils';

export abstract class ClassBaseComponent<T = {}> implements ClassComponent {
  protected _element: HTMLElement;
  protected _subscriptions: Unsubscribable[];

  private _hasChannelVideo: boolean;
  private _showChatroom: boolean;
  private _showMediaContent: boolean;
  protected channelId: string;
  protected eventRunning: boolean;

  constructor() {
    this._subscriptions = [api.state.subscribe(this.stateHandler.bind(this))];
  }

  public oncreate(vnode: VnodeDOM) {
    this._element = vnode.dom as HTMLElement;
  }

  protected stateHandler(value: IState) {
    const hasChannelVideo = isRTMPStream(value?.channel?.media) || !isEmptyString(value?.channel?.media as string);

    let isChanged = false;
    if (this._hasChannelVideo !== hasChannelVideo) {
      this._hasChannelVideo = !!hasChannelVideo;
      isChanged = true;
    }
    if (this._showChatroom !== value?.channel?.showChatroom) {
      this._showChatroom = value?.channel?.showChatroom;
      isChanged = true;
    }
    if (this._showMediaContent !== value?.channel?.showMedia) {
      this._showMediaContent = value?.channel?.showMedia;
      isChanged = true;
    }

    this.channelId = value?.channel?.id;

    this.eventRunning = !isEmptyString(value?.sid);

    if (isChanged) {
      redraw();
    }
  }

  public abstract view(T);

  public onremove() {
    this._subscriptions.forEach((item) => item.unsubscribe());
  }

  public get hasChannelVideo(): boolean {
    return this._hasChannelVideo;
  }

  public get showChatroom(): boolean {
    return this._showChatroom;
  }

  public get showMediaContent(): boolean {
    return this._showMediaContent;
  }
}
