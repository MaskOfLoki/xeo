import m, { Vnode } from 'mithril';
import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../../../../common/popups/PopupManager';
import { IUser } from '../../../../../../../../../common/common';

export interface IBanUserPopupAttrs extends IPopupAttrs {
  userToBan: IUser;
  banOrUnban: boolean;
}

export class BanUserPopup extends PopupComponent<IBanUserPopupAttrs> {
  protected userToBan: IUser;
  protected banOrUnban: boolean;
  public oninit(vnode: Vnode<IBanUserPopupAttrs>) {
    super.oninit(vnode);
    this.userToBan = vnode.attrs.userToBan;
    this.banOrUnban = vnode.attrs.banOrUnban;
  }

  public buttonConfirmHandler() {
    this.close(true);
    m.redraw();
  }

  public view() {
    return template.call(this);
  }
}
