import { ClassComponent, Vnode, redraw } from 'mithril';
import { IChannel, IState } from '../../../../common/common';
import { Unsubscribable } from 'rxjs';
import { api } from '../services/api';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export interface IChannelStateAttrs {
  channel: IChannel;
}

export abstract class ChannelStateComponent<T extends IChannelStateAttrs> implements ClassComponent<T> {
  protected _channelId: string;
  protected _stateSubscription: Unsubscribable;
  protected _suffix = '';
  protected _state: IState;
  protected _channelAttr: IChannel;

  public oninit(vnode: Vnode<T>) {
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate({ attrs }: Vnode<T>) {
    this._channelAttr = attrs.channel;

    if (!attrs.channel) {
      console.warn('channel should be provided as an attribute:', this.constructor.name);
      return;
    }

    if (this._channelId !== attrs.channel?.id) {
      this.unsubscribeState();
      this._channelId = attrs.channel.id;

      const namespaces: string[] = [this._channelId];

      if (!isEmptyString(this._suffix)) {
        namespaces.push(`${this._channelId}${this._suffix}`);
      }

      this._stateSubscription = api.state(...namespaces).subscribe(this.stateHandler.bind(this));
      this.channelChanged();
    }
  }

  protected channelChanged() {
    // method is supposed to be overrided in child classes
  }

  protected stateHandler(value: IState): void {
    this._state = value;
    this.channel.online = !!value?.channel;
    this.channel.cardSets = this.channel.cardSets || [
      {
        id: 0,
        name: 'SET 01',
      },
    ];
    redraw();
  }

  protected unsubscribeState() {
    if (this._stateSubscription) {
      this._stateSubscription.unsubscribe();
      this._stateSubscription = undefined;
    }
  }

  public onremove() {
    this.unsubscribeState();
  }

  public get channel(): IChannel {
    return this._state?.channel ?? this._channelAttr;
  }

  public abstract view(vnode: Vnode<T>);
}
