import { ClassComponent, redraw, Vnode } from 'mithril';
import Swal from 'sweetalert2';
import { IUser } from '../../../../../../../common/common';
import { PopupManager } from '../../../../../../../common/popups/PopupManager';
import { api } from '../../../../services/api';
import { SmsFeedback } from './feedback';
import { template } from './template';

export class SmsSettings implements ClassComponent {
  protected phoneNumberToTest: string;
  protected _message: string;
  protected _image: string;
  protected _queueId: number;
  protected _users: IUser[] = [];

  public view({ attrs }: Vnode) {
    return template.call(this, attrs);
  }

  public oninit() {
    api.getSMSUsers().then((users: IUser[]) => {
      this._users = users;
      redraw();
    });
  }

  public setMessage(msg: string) {
    this._message = msg;
  }

  public setImage(value: string) {
    this._image = value;
  }

  public async sendSms() {
    if (!this._message || this._message.length < 1) {
      await Swal.fire({
        title: `Please provide any text to send.`,
        showCancelButton: false,
      });
      return;
    }
    if (this._users.length < 1) {
      await Swal.fire({
        title: `No users found to send SMS.`,
        showCancelButton: false,
      });
      return;
    }

    const phones = this._users.map((user: IUser) => user.phone);

    const result = await Swal.fire({
      title: `Do you want to send the message to ${phones.length} users?`,
      showCancelButton: true,
    });
    if (result.dismiss) {
      return;
    }

    this._queueId = await api.sendSmsInQueue(phones, this._message, this._image);

    await PopupManager.show(SmsFeedback, {
      queueId: this._queueId,
      total: phones.length,
    });
  }

  public async testSendSms() {
    if (!this.phoneNumberToTest || this.phoneNumberToTest.length < 10) {
      await Swal.fire({
        title: `Please provide phone number at least 10 digits length.`,
        showCancelButton: false,
      });
      return;
    }

    if (!this._message || this._message.length < 1) {
      await Swal.fire({
        title: `Please provide any text to send.`,
        showCancelButton: false,
      });
      return;
    }

    const result = await Swal.fire({
      title: `Do you want to send the message to ${this.phoneNumberToTest}?`,
      showCancelButton: true,
    });
    if (result.dismiss) {
      return;
    }

    await api.sendSms([this.phoneNumberToTest], this._message, this._image);

    await Swal.fire({
      title: `Message sent`,
      showCancelButton: false,
    });
  }
}
