import { Vnode } from 'mithril';
import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../../../../common/popups/PopupManager';
import { IConfig } from '../../../../../../../../../common/common';
import { api } from '../../../../../../services/api';
import { toPromise } from '../../../../../../utils';
import Swal from 'sweetalert2';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export interface ISendSMSPopupAttrs extends IPopupAttrs {
  numbers: string[];
}

export class SendSMSPopup extends PopupComponent<ISendSMSPopupAttrs> {
  public numbers: string[];
  public message: string;
  public async oninit(vnode: Vnode<ISendSMSPopupAttrs>) {
    super.oninit(vnode);
    this.numbers = vnode.attrs.numbers;
    const config: IConfig = await toPromise(api.config('common'));
    this.message = config.sms?.defaultText;
  }

  public async buttonConfirmHandler() {
    if (isEmptyString(this.message)) {
      await Swal.fire({
        title: `Please provide any text to send.`,
        showCancelButton: true,
      });
      return;
    }

    await api.sendSms(this.numbers, this.message);

    this.close();
  }

  public view() {
    return template.call(this);
  }
}
