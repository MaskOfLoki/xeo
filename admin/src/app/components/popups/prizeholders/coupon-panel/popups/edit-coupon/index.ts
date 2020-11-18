import { Vnode } from 'mithril';
import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../../../../common/popups/PopupManager';
import { IGCCoupon } from '@gamechangerinteractive/xc-backend';
import { api } from '../../../../../../services/api';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';

export interface IEditCouponPopupAttrs extends IPopupAttrs {
  coupon: IGCCoupon;
}

export class EditCouponPopup extends PopupComponent<IEditCouponPopupAttrs> {
  public isRedemptionTimeLimit = false;
  public isPrizeLink = false;
  public isCustomRedemptionCode = false;
  private _redemptionDays = 0;
  private _redemptionHours = 0;
  private _redemptionMinutes = 0;
  protected coupon: IGCCoupon;

  public oninit(vnode: Vnode<IEditCouponPopupAttrs>) {
    super.oninit(vnode);
    this.coupon = vnode.attrs.coupon;
    const { days, hours, minutes } = this.parseExpiration(this.coupon.expiresAfter);
    this._redemptionDays = days || 0;
    this._redemptionHours = hours || 0;
    this._redemptionMinutes = minutes || 0;
    this.isRedemptionTimeLimit = !!this.coupon.expiresAfter;
    this.isPrizeLink = !!this.coupon.redirectUrl;
    this.isCustomRedemptionCode = !!this.coupon.redemptionCodeData;
  }

  protected get redemptionDays(): number {
    return this._redemptionDays;
  }

  protected set redemptionDays(value: number) {
    if (isNaN(value)) {
      return;
    }

    this._redemptionDays = value;
    this.updateCouponExpiration();
  }

  protected get redemptionMinutes(): number {
    return this._redemptionMinutes;
  }

  protected set redemptionMinutes(value: number) {
    if (isNaN(value)) {
      return;
    }

    this._redemptionMinutes = value;
    this.updateCouponExpiration();
  }

  protected get redemptionHours(): number {
    return this._redemptionHours;
  }

  protected set redemptionHours(value: number) {
    if (isNaN(value)) {
      return;
    }

    this._redemptionHours = value;
    this.updateCouponExpiration();
  }

  protected get ensureRedemptionCodeData() {
    if (!this.coupon.redemptionCodeData) {
      this.coupon.redemptionCodeData = {};
    }
    return this.coupon.redemptionCodeData;
  }

  private updateCouponExpiration() {
    this.coupon.expiresAfter = !this.isRedemptionTimeLimit
      ? null
      : 60 * (this.redemptionMinutes + this._redemptionHours * 60 + this._redemptionDays * 24 * 60);
  }

  private parseExpiration = (expiresAfter: number): { hours: number; minutes: number; days: number } => {
    const days = Math.floor(expiresAfter / (3600 * 24));
    const hours = Math.floor(expiresAfter / 3600) % 24;
    const minutes = Math.floor(expiresAfter / 60) % 60;
    return {
      days,
      hours,
      minutes,
    };
  };

  public buttonConfirmHandler() {
    if (isEmptyString(this.coupon.name)) {
      Swal.fire({
        icon: 'warning',
        title: 'Please, provide a coupon name',
      });
      return;
    }

    if (isEmptyString(this.coupon.image)) {
      Swal.fire({
        icon: 'warning',
        title: 'Please, upload the image for the coupon.',
      });
      return;
    }

    this.updateCouponExpiration();
    this.coupon.redirectUrl = this.isPrizeLink ? this.coupon.redirectUrl : null;
    this.coupon.redemptionCodeData = this.isCustomRedemptionCode ? this.coupon.redemptionCodeData : null;

    api.saveCoupon(this.coupon).then(() => this.close(true));
  }

  public view() {
    return template.call(this);
  }
}
