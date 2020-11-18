import IMask from 'imask';
import { VnodeDOM, redraw } from 'mithril';
import { api } from '../../services/api';
import { ClassBaseComponent } from '../../components/class-base';
import { template } from './template';
import { swalAlert } from '../../utils';

export class FrontGateScreen extends ClassBaseComponent {
  private _maskedPhone: IMask.InputMask<{ mask: string }>;
  private _isSubmitted: boolean;
  public verificationCode = '';
  public country: string[] = ['United States', '1'];
  public timerResend: number;

  private _timerResendId: number;

  public oncreate(vnode: VnodeDOM) {
    super.oncreate(vnode);

    const inputElement: HTMLInputElement = this._element.querySelector('#groupPhone').querySelector('input');
    this._maskedPhone = IMask(inputElement, {
      mask: '000-000-0000',
    });

    api.markFrontgate();
  }

  public async submitHandler() {
    const phone = this.country[1].split('-').join('') + this._maskedPhone.unmaskedValue.trim();

    if (phone.length !== 11 && phone.length !== 12) {
      swalAlert({
        icon: 'warning',
        text: 'Please, provide valid phone number.',
      });
      return;
    }

    try {
      await api.verifyPhone(phone);
      this._isSubmitted = true;
      this.timerResend = 60;
      this._timerResendId = window.setInterval(this.timerResendTickHandler.bind(this), 1000);
      redraw();
    } catch (e) {
      const message = e.response ? e.response.data : e.toString();
      swalAlert({
        icon: 'warning',
        text: `Unable to submit phone. Details: ${message}`,
      });
    }
  }

  private timerResendTickHandler() {
    this.timerResend--;

    if (this.timerResend <= 0) {
      clearInterval(this._timerResendId);
    }

    redraw();
  }

  public async verifyHandler() {
    try {
      // routing is handled by main.ts
      await api.verifyPhoneCode(this.verificationCode);
    } catch (e) {
      swalAlert({
        icon: 'warning',
        text: `Please make sure the verification code is correct`,
      });
    }
  }

  public onremove() {
    clearInterval(this._timerResendId);
  }

  public view() {
    return template.call(this);
  }

  public get isSubmitted(): boolean {
    return this._isSubmitted;
  }
}
