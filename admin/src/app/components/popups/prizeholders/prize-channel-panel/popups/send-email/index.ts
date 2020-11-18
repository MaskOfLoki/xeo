import { Vnode } from 'mithril';
import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../../../../common/popups/PopupManager';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { api } from '../../../../../../services/api';
import { IConfig } from '../../../../../../../../../common/common';
import { toPromise } from '../../../../../../utils';

export interface ISendEmailPopupAttrs extends IPopupAttrs {
  recipients: string[];
}

export class SendEmailPopup extends PopupComponent<ISendEmailPopupAttrs> {
  public recipients: string[];
  public htmlBody: string;
  public subject: string;
  public footerImageUrl: string;

  public async oninit(vnode: Vnode<ISendEmailPopupAttrs>) {
    super.oninit(vnode);
    this.recipients = vnode.attrs.recipients;
    const config: IConfig = await toPromise(api.config('common'));
    this.subject = config.email?.defaultSubject;
    this.htmlBody = config.email?.defaultHtmlBody;
  }

  public async buttonConfirmHandler() {
    if (isEmptyString(this.subject)) {
      await Swal.fire({
        title: `SEND EMAIL.`,
        html: `Please provide the email subject.`,
      });
      return;
    }

    if (isEmptyString(this.htmlBody)) {
      await Swal.fire({
        title: `SEND EMAIL.`,
        html: `Please provide the email body.`,
      });
      return;
    }

    let sendingBody = this.htmlBody;
    if (!isEmptyString(this.footerImageUrl)) {
      sendingBody = sendingBody + `<br/><img src="${this.footerImageUrl}"/>`;
    }
    await api.sendEmail(this.recipients, this.subject, sendingBody);

    this.close();
  }

  public view() {
    return template.call(this);
  }

  public addImage(url: string): void {
    this.footerImageUrl = url;
  }
}
