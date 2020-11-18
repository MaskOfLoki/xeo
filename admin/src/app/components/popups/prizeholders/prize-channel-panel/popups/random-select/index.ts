import m, { Vnode } from 'mithril';
import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../../../../common/popups/PopupManager';

export type IRandomSelectPopupAttrs = IPopupAttrs;

export class RandomSelectPopup extends PopupComponent<IRandomSelectPopupAttrs> {
  public selectCount = 1;

  public oninit(vnode: Vnode<IRandomSelectPopupAttrs>) {
    super.oninit(vnode);
  }

  public buttonConfirmHandler() {
    this.close(this.selectCount);
    m.redraw();
  }

  public view() {
    return template.call(this);
  }
}
