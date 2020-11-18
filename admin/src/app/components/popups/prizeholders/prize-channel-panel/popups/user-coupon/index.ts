import m, { Vnode } from 'mithril';
import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../../../../common/popups/PopupManager';
import { IGCCoupon } from '@gamechangerinteractive/xc-backend';

export interface IUserCouponPopupAttrs extends IPopupAttrs {
  coupons: IGCCoupon[];
}

export class UserCouponPopup extends PopupComponent<IUserCouponPopupAttrs> {
  public oninit(vnode: Vnode<IUserCouponPopupAttrs>) {
    super.oninit(vnode);
  }

  public buttonConfirmHandler() {
    this.close();
    m.redraw();
  }

  public view({ attrs }: Vnode<IUserCouponPopupAttrs>) {
    return template.call(this, attrs.coupons);
  }
}
