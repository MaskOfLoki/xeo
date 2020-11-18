import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';
import { api } from '../../../../../services/api';
import Swal from 'sweetalert2';
import { IConfig } from '../../../../../../../../common/common';
import { toPromise } from '../../../../../utils';

export class SmsSettings implements ClassComponent {
  protected phoneNumberToTest: string;

  public view({ attrs }: Vnode) {
    return template.call(this, attrs);
  }

  public async testSendSms() {
    if (!this.phoneNumberToTest || this.phoneNumberToTest.length < 10) {
      await Swal.fire({
        title: `Please provide phone number at least 10 digits length.`,
        showCancelButton: true,
      });
      return;
    }

    const config: IConfig = await toPromise(api.config('common'));
    const body = config.sms?.defaultText;

    if (!body || body.length < 1) {
      await Swal.fire({
        title: `Please provide any text to send.`,
        showCancelButton: true,
      });
      return;
    }
    await api.sendSms([this.phoneNumberToTest], body);
  }
}
