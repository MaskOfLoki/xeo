import { redraw, ClassComponent } from 'mithril';
import { template } from './template';
import { IGCAwardedCoupon } from '@gamechangerinteractive/xc-backend/types/IGCAwardedCoupon';
import { api } from '../../../services/api';
import { PopupManager } from '../../../../../../common/popups/PopupManager';
import { CouponPopup } from '../../../components/coupon-popup';
import { route } from 'mithril';
import { IAwardedCoupon, IState } from '../../../../../../common/common';
import { isRTMPStream } from '../../../../../../common/utils';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export class PrizesScreen implements ClassComponent {
  private _coupons: IGCAwardedCoupon[] = [];
  private _hasChannelVideo: boolean;
  private _showMediaContent: boolean;

  public async oninit() {
    api.state.subscribe(this.stateHandler.bind(this));
    this._coupons = await api.getAwardedCoupons();
    redraw();
  }

  private stateHandler(value: IState): void {
    const hasChannelVideo = isRTMPStream(value?.channel?.media) || !isEmptyString(value?.channel?.media as string);

    let isChanged = false;
    if (this._hasChannelVideo !== hasChannelVideo) {
      this._hasChannelVideo = hasChannelVideo;
      isChanged = true;
    }
    if (this._showMediaContent !== value?.channel?.showMedia) {
      this._showMediaContent = value?.channel?.showMedia;
      isChanged = true;
    }
    if (isChanged) {
      redraw();
    }
  }

  public couponHandler(coupon: IAwardedCoupon) {
    PopupManager.show(CouponPopup, { coupon });
  }

  public goToHome() {
    route.set('home');
  }

  public get coupons() {
    return this._coupons;
  }

  public view() {
    return template.call(this);
  }

  public get hasChannelVideo(): boolean {
    return this._hasChannelVideo;
  }

  public get showMediaContent(): boolean {
    return this._showMediaContent;
  }
}
