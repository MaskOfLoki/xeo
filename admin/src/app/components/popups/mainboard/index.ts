import { template } from './template';
import { Vnode } from 'mithril';
import { Unsubscribable } from 'rxjs';
import { IPopupAttrs, PopupComponent } from '../../../../../../common/popups/PopupManager';
import { IChannelStateAttrs } from '../../../utils/ChannelStateComponent';
import { MainboardLayout, MainboardZone, IChannel } from '../../../../../../common/common';
import { MainboardPreview } from '../../mainboard-preview';
import { api } from '../../../services/api';

interface IMainboardSettingsPopupAttrs extends IPopupAttrs, IChannelStateAttrs {}

export const MAINBOARD_LAYOUT_ZONE_LIST = {
  [MainboardLayout.FULLSCREEN]: [
    MainboardZone.FULLSCREEN_ZONE5,
    MainboardZone.FULLSCREEN_ZONE4,
    MainboardZone.LEADERBOARD,
  ],
  [MainboardLayout.SIDESLAB]: [MainboardZone.SIDESLAB_ZONE3, MainboardZone.SIDESLAB_ZONE2, MainboardZone.LEADERBOARD],
  [MainboardLayout.LOWER_THIRD]: [
    MainboardZone.LOWER_THIRD_ZONE3,
    MainboardZone.LOWER_THIRD_ZONE2,
    MainboardZone.LEADERBOARD,
  ],
};

export const MAINBOARD_ZONE_STRING = {
  [MainboardZone.FULLSCREEN_ZONE5]: '5 ZONE',
  [MainboardZone.FULLSCREEN_ZONE4]: '4 ZONE',
  [MainboardZone.SIDESLAB_ZONE3]: '3 ZONE',
  [MainboardZone.SIDESLAB_ZONE2]: '2 ZONE',
  [MainboardZone.LOWER_THIRD_ZONE3]: '3 ZONE',
  [MainboardZone.LOWER_THIRD_ZONE2]: '2 ZONE',
  [MainboardZone.LEADERBOARD]: 'LEADERBOARD',
};

export class MainboardSettingsPopup extends PopupComponent<IMainboardSettingsPopupAttrs> {
  public layout: MainboardLayout;
  public zone: MainboardZone;
  public channel: IChannel;
  public mainboardPreview: MainboardPreview;
  private _subscription: Unsubscribable;

  public oninit(vnode: Vnode<IMainboardSettingsPopupAttrs>) {
    super.oninit(vnode);
    this.channel = vnode.attrs.channel;
    this.layout = MainboardLayout.FULLSCREEN;
    this.zone = MAINBOARD_LAYOUT_ZONE_LIST[this.layout][0];
  }

  public layoutSelectHandler(layout: MainboardLayout) {
    this.layout = layout;
    this.zone = MAINBOARD_LAYOUT_ZONE_LIST[this.layout][0];
    api.markAdminAction('MAINBOARD LAYOUT SELECT', layout);
    this.mainboardPreview.updateLayoutZone(this.layout, this.zone);
  }

  public mainboardPreviewReadyHandler(value: MainboardPreview) {
    this.mainboardPreview = value;
    this.mainboardPreview.updateLayoutZone(this.layout, this.zone);
  }

  public zoneSelectHandler(zone: MainboardZone) {
    this.zone = zone;
    api.markAdminAction('MAINBOARD ZONE SELECT', zone);
    this.mainboardPreview.updateLayoutZone(this.layout, this.zone);
  }

  public onremove() {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = undefined;
    }
  }

  public view() {
    return template.call(this);
  }
}
