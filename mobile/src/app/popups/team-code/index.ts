import { IPopupAttrs, PopupComponent } from '../../../../../common/popups/PopupManager';
import { Vnode } from 'mithril';
import { template } from './template';

export class TeamCodePopup extends PopupComponent<IPopupAttrs> {
  protected code = '';

  public view(vnode: Vnode<IPopupAttrs>) {
    return template.call(this);
  }

  protected onSubmit() {
    this.close(this.code);
  }
}
