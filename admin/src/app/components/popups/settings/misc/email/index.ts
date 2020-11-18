import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';
import { api } from '../../../../../services/api';
import Swal from 'sweetalert2';
import { IConfig } from '../../../../../../../../common/common';
import { toPromise } from '../../../../../utils';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { isEmailValid } from '../../../../../../../../common/utils';

export class EmailSettings implements ClassComponent {
  protected emailRecipientToTest: string;

  public view({ attrs }: Vnode) {
    return template.call(this, attrs);
  }

  public async testSendEmail() {
    if (!isEmailValid(this.emailRecipientToTest)) {
      await Swal.fire({
        title: `Please provide valid email address to send test email to.`,
        showCancelButton: true,
      });
      return;
    }

    const config: IConfig = await toPromise(api.config('common'));
    const htmlBody = config.email?.defaultHtmlBody;
    const subject = config.email?.defaultSubject;

    if (isEmptyString(htmlBody)) {
      await Swal.fire({
        title: 'SEND EMAIL',
        html: `Please provide email body.`,
      });
      return;
    }

    if (isEmptyString(subject)) {
      await Swal.fire({
        title: 'SEND EMAIL',
        html: `Please provide email subject.`,
      });
      return;
    }
    await api.sendEmail([this.emailRecipientToTest], subject, htmlBody);
  }
}
