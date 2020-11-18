import { template } from './template';
import { ChannelStateComponent, IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';
import { IChannel, IMainboardConfig } from '../../../../../../../common/common';
import basicContext from 'basiccontext';
import { PopupManager } from '../../../../../../../common/popups/PopupManager';
import { Unsubscribable } from 'rxjs';
import { VnodeDOM, redraw } from 'mithril';
import { api } from '../../../../services/api';
import { MainboardSettingsPopup } from '../../../../components/popups/mainboard';

type IOnlineChannelControls = IChannelStateAttrs & {
  onsave: (value: IChannel) => void;
};

export class OnlineChannelControls extends ChannelStateComponent<IOnlineChannelControls> {
  public showLiveResponses: boolean;
  public showMediaContent: boolean;

  private _subscription: Unsubscribable;
  private _onsave: (value: IChannel) => void;

  private _items = [
    {
      title: 'Configuration Panel',
      fn: this.mainboardSettingHandler.bind(this),
    },
  ];

  public oninit(vnode: VnodeDOM<IOnlineChannelControls>) {
    super.oninit(vnode);
    this.showMediaContent = this.channel.showMedia;
    this._onsave = vnode.attrs.onsave;
  }

  public mainboardSettingHandler() {
    PopupManager.show(MainboardSettingsPopup, { channel: this.channel });
  }

  public showLiveResponsesChangeHandler(value: boolean) {
    this.showLiveResponses = value;
    api.setConfigField('mainboard.showLiveResponses', value, `${this._channelId}mainboard`);
  }

  public showMediaChangeHandler(value: boolean) {
    this.showMediaContent = value;
    this.channel.showMedia = value;
    this._onsave(this.channel);
  }

  protected channelChanged() {
    this.unsubscribe();

    if (!this.channel) {
      return;
    }

    this._subscription = api
      .config<IMainboardConfig>(`${this._channelId}mainboard`)
      .subscribe((value) => (this.showLiveResponses = !!value?.mainboard?.showLiveResponses));

    redraw();
  }

  private unsubscribe() {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = undefined;
    }
  }

  public onremove() {
    super.onremove();
    this.unsubscribe();
  }

  public view({ attrs }: VnodeDOM<IOnlineChannelControls>) {
    return template.call(this, attrs);
  }

  public menuBtnClickHandler(e) {
    basicContext.show(this._items, e);
  }
}
