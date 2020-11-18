import { Vnode } from 'mithril';
import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../common/popups/PopupManager';
import { IChannel } from '../../../../../../common/common';
import { api } from '../../../services/api';
import { MAX_CHANNEL_DELETE_DAYS } from '../../../utils';

export interface IDeleteChannelPopupAttrs extends IPopupAttrs {
  channels: IChannel[];
  ondelete: (channel: IChannel) => Promise<void>;
  onrestore: (channel: IChannel) => Promise<void>;
}

const PAGE_CHANNEL_COUNT = 6;

export class DeleteChannelPopup extends PopupComponent<IDeleteChannelPopupAttrs> {
  private _deletedChannels: IChannel[] = [];
  private _channels: IChannel[] = [];
  private _curPage: number;
  private _channel: IChannel;
  private _ondelete: (channel: IChannel) => Promise<void>;
  private _onrestore: (channel: IChannel) => Promise<void>;
  private _isDeleteView = false;

  public oninit(vnode: Vnode<IDeleteChannelPopupAttrs>) {
    super.oninit(vnode);
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate(vnode: Vnode<IDeleteChannelPopupAttrs>) {
    const deletedChannels = vnode.attrs.channels?.filter((channel) => channel.deleted);

    if (vnode.attrs.channels != this._channels || deletedChannels?.length != this._deletedChannels?.length) {
      this._channels = vnode.attrs.channels;
      this._deletedChannels = deletedChannels;

      if (!this._deletedChannels) {
        this._deletedChannels = [];
      }

      this._channel = null;
      this._curPage = 1;
      this._isDeleteView = false;
    }

    this._ondelete = vnode.attrs.ondelete;
    this._onrestore = vnode.attrs.onrestore;
  }

  public channelClickHandler(channel: IChannel) {
    this._channel = channel;
  }

  public goToPage(page: number) {
    this._curPage = page;
  }

  public get curPageChannels(): IChannel[] {
    const curPageStartIndex = (this._curPage - 1) * PAGE_CHANNEL_COUNT;
    return this._deletedChannels.slice(curPageStartIndex, curPageStartIndex + PAGE_CHANNEL_COUNT);
  }

  public get totalPages(): number {
    const pageCount = Math.floor(this._deletedChannels.length / PAGE_CHANNEL_COUNT);

    if (this._deletedChannels.length - pageCount * PAGE_CHANNEL_COUNT == 0) {
      return pageCount;
    } else {
      return pageCount + 1;
    }
  }

  public get channel(): IChannel {
    return this._channel;
  }

  public get curPage(): number {
    return this._curPage;
  }

  public async deleteHandler() {
    if (this._ondelete && this._channel) {
      api.markAdminAction('DELETED CHANNEL DELETE', { id: this._channel.id, name: this._channel.name });
      await this._ondelete(this._channel);
      this._channel = null;
    }
  }

  public goToDeleteView() {
    this._isDeleteView = true;
  }

  public cancelHandler() {
    this._isDeleteView = false;
  }

  public async restoreHandler() {
    if (this._onrestore && this._channel) {
      api.markAdminAction('DELETED CHANNEL RESTORE', { id: this._channel.id, name: this._channel.name });
      await this._onrestore(this._channel);
      this._channel = null;
    }
  }

  public daysRemaining(channel: IChannel): number {
    const time = (api.time() - channel.deleted) * 0.001;
    let days = 0;

    if (typeof channel.deleted == 'number') {
      days = Math.floor(time / 3600 / 24);
    } else {
      days = 0;
    }

    return MAX_CHANNEL_DELETE_DAYS - days;
  }

  public get isDeleteView(): boolean {
    return this._isDeleteView;
  }

  public view() {
    return template.call(this);
  }
}
