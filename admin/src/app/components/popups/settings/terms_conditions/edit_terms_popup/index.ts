import { template } from './template';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { Vnode } from 'mithril';
import { IPopupAttrs, PopupComponent } from '../../../../../../../../common/popups/PopupManager';

interface ITermsConditionPopupAttrs extends IPopupAttrs {
  name?: string;
  url?: string;
}

export class TermsConditionPopup extends PopupComponent<ITermsConditionPopupAttrs> {
  public name = '';
  public url = '';

  public oninit(vnode: Vnode<ITermsConditionPopupAttrs>): void {
    super.oninit(vnode);
    this.name = vnode.attrs.name || '';
    this.url = vnode.attrs.url || '';
  }

  public buttonSaveHandler() {
    if (isEmptyString(this.name)) {
      Swal.fire('Please enter a valid name');
      return;
    }

    if (isEmptyString(this.url) || !/^https?:\/\/.+/.test(this.url)) {
      Swal.fire('Please enter a valid url');
      return;
    }

    this.close({ name: this.name, url: this.url });
  }

  public view() {
    return template.call(this);
  }
}
