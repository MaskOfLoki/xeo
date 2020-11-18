import { template } from './template';
import { Vnode } from 'mithril';
import Swal from 'sweetalert2';
import { randInt, isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { IPopupAttrs, PopupComponent } from '../../../../../../../../common/popups/PopupManager';
import { IMarketingMessage } from '../../../../../../../../common/common';
import { validURL } from '../../../../../utils';
import { api } from '../../../../../services/api';

interface IEditMarketingMessagePopupAttrs extends IPopupAttrs {
  type?: string;
  message?: IMarketingMessage;
  channelId: string;
}

export class EditMarketingMessagePopup extends PopupComponent<IEditMarketingMessagePopupAttrs> {
  private _message: IMarketingMessage;
  private _channelId: string;
  private _type: string;
  public isText: boolean;

  public oninit(vnode: Vnode<IEditMarketingMessagePopupAttrs>) {
    super.oninit(vnode);
    this._type = vnode.attrs.type;
    this._message = vnode.attrs.message;
    this._channelId = vnode.attrs.channelId;

    if (!this._message) {
      this._message = {
        id: randInt(1000000000),
        type: this._type,
        text: '',
        timer: 60,
      };
    }

    this.isText = this._message.text != null;
  }

  public async buttonSaveHandler() {
    this._message.text = this._message.text?.trim();

    if (this.isText && isEmptyString(this._message.text)) {
      Swal.fire('Please, fill in the text', '', 'warning');
      return;
    }

    this._message.image = this._message.image?.trim();

    if (!this.isText && isEmptyString(this._message.image)) {
      Swal.fire('Please, provide an image', '', 'warning');
      return;
    }

    this._message.url = this._message.url?.trim();

    if (!isEmptyString(this._message.url) && !validURL(this._message.url)) {
      Swal.fire('Please, provide valid url');
      return;
    }

    if (this.isText) {
      this._message.image = null;
    } else {
      this._message.text = null;
    }

    await api.saveMarketingMessage(this._message, this._channelId);
    this.close();
  }

  public view() {
    return template.call(this);
  }

  public get message(): IMarketingMessage {
    return this._message;
  }
}
