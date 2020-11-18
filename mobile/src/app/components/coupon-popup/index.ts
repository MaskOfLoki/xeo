import { redraw, Vnode, VnodeDOM } from 'mithril';
import { template } from './template';
import { PopupComponent, IPopupAttrs } from '../../../../../common/popups/PopupManager';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { api } from '../../services/api';
import { IAwardedCoupon } from '../../../../../common/common';

export interface ICouponPopupAttrs extends IPopupAttrs<void> {
  coupon: IAwardedCoupon;
}

export class CouponPopup extends PopupComponent<any> {
  private _coupon: IAwardedCoupon;
  private _expired: boolean;

  public interval: any;
  public timeRemaining: number;

  public oninit(vnode: VnodeDOM<ICouponPopupAttrs>) {
    super.oninit(vnode);
    this._coupon = vnode.attrs.coupon;
    // Add one for first interval execution
    this.timeRemaining = this.getRemainingTime() + 1;
    this.interval = setInterval(() => {
      --this.timeRemaining;
      if (this.timeRemaining <= 0) {
        clearInterval(this.interval);
        this.interval = null;
        this.expired = true;
      }
      redraw();
    }, 1000);
  }

  public onbeforeupdate(vnode: VnodeDOM<ICouponPopupAttrs>) {
    this._coupon = vnode.attrs.coupon;
  }

  public onClickHandler(): void {
    if (!isEmptyString(this._coupon.redirectUrl)) {
      const pattern = /^[^/]+:\/\//i;
      const missing = !pattern.test(this._coupon.redirectUrl);
      const url = missing ? `http://${this._coupon.redirectUrl}` : this._coupon.redirectUrl;
      window.open(url, '_blank');
    }
  }

  public get expired(): boolean {
    if (this._coupon.expiresAfter) {
      this._expired = this.getRemainingTime() <= 0;
    } else {
      this._expired = false;
    }
    return this._expired;
  }

  public set expired(value: boolean) {
    this._expired = value;
    redraw();
  }

  public getRemainingTime(): number {
    const timeInSeconds = Math.floor(this._coupon.awardedAt.getTime() / 1000);
    return timeInSeconds + this._coupon.expiresAfter - Math.floor(api.time() / 1000);
  }

  public view({ attrs }: Vnode<ICouponPopupAttrs>) {
    return template.call(this, attrs);
  }
}
