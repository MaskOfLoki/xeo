import { ClassComponent, redraw, Vnode } from 'mithril';
import { template } from './template';
import { GAME_ID, ICoupon, IPreset } from '../../../../../../../common/common';
import { PopupManager } from '../../../../../../../common/popups/PopupManager';
import { isEmptyString, uuid } from '@gamechangerinteractive/xc-backend/utils';
import { EditCouponPopup } from './popups/edit-coupon';
import { api } from '../../../../services/api';
import Swal from 'sweetalert2';

export interface ICouponPanelAttrs {
  onawardeveryone: (value: ICoupon) => void;
  onawardselected: (value: ICoupon) => void;
}

const COUPON_SET = 'coupon-set';

export class CouponPanel implements ClassComponent<ICouponPanelAttrs> {
  private _couponSets: IPreset[] = [];
  private _coupons: ICoupon[] = [];
  private _selectedCoupon: ICoupon;
  private _selectedCouponSet: IPreset;

  public view({ attrs }: Vnode<ICouponPanelAttrs>) {
    return template.call(this, attrs);
  }

  public async oninit() {
    [this._coupons, this._couponSets] = await Promise.all([api.getCoupons(), api.getPresets(COUPON_SET)]);
    await this.ensureDefaultCouponSet();
    this._selectedCouponSet = this.couponSets[0];

    this._coupons.forEach((coupon) => {
      if (!this._couponSets.some((value) => value.id === coupon.couponSetId)) {
        coupon.couponSetId = this._selectedCouponSet.id;
        api.saveCoupon(coupon);
      }
    });

    redraw();
  }

  private async ensureDefaultCouponSet() {
    if (this._couponSets.length === 0) {
      const setId = uuid();

      await api.savePreset({
        id: setId,
        name: 'DEFAULT',
        type: COUPON_SET,
      });

      this._couponSets = await api.getPresets(COUPON_SET);
      this.coupons.forEach((coupon) => (coupon.couponSetId = setId));
    }
  }

  public get coupons(): ICoupon[] {
    return this._coupons;
  }

  public get selectedCoupon(): ICoupon {
    return this._selectedCoupon;
  }

  public get selectedCouponSet(): IPreset {
    return this._selectedCouponSet;
  }

  public get couponSets(): IPreset[] {
    return this._couponSets;
  }

  public async couponAddHandler() {
    const result = await PopupManager.show(EditCouponPopup, {
      coupon: { id: uuid(), name: '', image: '', couponSetId: this.selectedCouponSet?.id, gid: GAME_ID } as ICoupon,
    });

    if (result) {
      this._coupons = await api.getCoupons();
      redraw();
    }
  }

  public couponSelectedHandler(value: ICoupon) {
    this._selectedCoupon = value;
  }

  public async onCouponEdit() {
    if (!this._selectedCoupon) {
      return;
    }

    const result = await PopupManager.show(EditCouponPopup, {
      coupon: this._selectedCoupon,
    });

    if (result) {
      redraw();
    }
  }

  protected onCouponSetChange(value: IPreset) {
    this._selectedCouponSet = value;
    redraw();
  }

  public async onCouponDelete() {
    const coupon = this._selectedCoupon;

    if (!coupon) {
      return;
    }

    const result = await Swal.fire({
      title: `Are you sure you want to delete coupon "${coupon.name}"?`,
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    if (!coupon.id) {
      throw new Error(`Empty id in coupon "${coupon.name}".`);
    }

    await api.deleteCoupon(coupon.id);
    const index = this.coupons.indexOf(coupon, 0);
    if (index > -1) {
      this.coupons.splice(index, 1);
    }
    redraw();
  }

  public async couponSetAddHandler() {
    const result = await Swal.fire({
      title: 'CREATE NEW SET',
      showCancelButton: true,
      input: 'text',
      preConfirm: (value) => {
        if (isEmptyString(value)) {
          Swal.showValidationMessage('Please provide valid coupon set name');
        } else if (this.couponSets.find((item) => item.name === value)) {
          Swal.showValidationMessage(`Coupon Set "${value} already exists`);
        }
      },
    });

    if (result.dismiss || isEmptyString(result.value)) {
      return;
    }

    await api.savePreset({
      id: uuid(),
      type: COUPON_SET,
      name: result.value,
    });

    this._couponSets = await api.getPresets(COUPON_SET);
    this._selectedCouponSet = this._couponSets.find((s) => s.name === result.value);
    redraw();
  }

  public async couponSetEditHandler() {
    if (!this._selectedCouponSet) {
      return;
    }

    const result = await Swal.fire({
      title: 'EDIT COUPON SET',
      showCancelButton: true,
      input: 'text',
      preConfirm: (value) => {
        if (isEmptyString(value)) {
          Swal.showValidationMessage('Please provide valid coupon set name');
        } else if (this.couponSets.find((item) => item.name === value)) {
          Swal.showValidationMessage(`Coupon Set "${value} already exists`);
        }
      },
    });

    if (result.dismiss || isEmptyString(result.value)) {
      return;
    }

    this._selectedCouponSet.name = result.value;
    await api.savePreset(this._selectedCouponSet);
    redraw();
  }

  public async couponSetDeleteHandler() {
    if (!this.selectedCouponSet?.id) {
      // no set was selected
      return;
    }

    if (this.couponSets.length <= 1) {
      // cannot delete last set
      return;
    }

    const result = await Swal.fire({
      title: 'DELETE COUPON SET',
      text: `Are you sure you want to delete coupon set "${this._selectedCouponSet.name}"? All coupons in this set will be permanently deleted.`,
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    const couponsToDelete = this.coupons
      .filter((c) => c.couponSetId === this.selectedCouponSet.id)
      .map((c) => api.deleteCoupon(c.id));
    // delete coupons first
    await Promise.all(couponsToDelete);
    // then coupon set itself
    await api.deletePreset(this.selectedCouponSet);
    const index = this.couponSets.indexOf(this.selectedCouponSet, 0);

    if (index > -1) {
      this.couponSets.splice(index, 1);
    }

    this._selectedCouponSet = this.couponSets[0];
    redraw();
  }
}
