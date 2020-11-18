import m, { Vnode } from 'mithril';
import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../../../../common/popups/PopupManager';

export interface IBanUsersPopupAttrs extends IPopupAttrs {
  userCount: number;
  banOrUnban: boolean;
}

export class BanUsersPopup extends PopupComponent<IBanUsersPopupAttrs> {
  protected userCount: number;
  protected banOrUnban: boolean;
  public oninit(vnode: Vnode<IBanUsersPopupAttrs>) {
    super.oninit(vnode);
    this.userCount = vnode.attrs.userCount;
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
