import { PopupComponent, IPopupAttrs } from '../../../../../../common/popups/PopupManager';
import { ICardSet, IChannel } from '../../../../../../common/common';
import m, { Vnode } from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { template } from './template';
import Swal from 'sweetalert2';
import './module.scss';

export interface IEditCardSetAttrs extends IPopupAttrs {
  cardSet: ICardSet;
  channel: IChannel;
}
export class EditCardSetPopup extends PopupComponent<IEditCardSetAttrs> {
  public cardSet: ICardSet;
  private _channel: IChannel;

  public oninit(vnode: Vnode<IEditCardSetAttrs>) {
    super.oninit(vnode);
    this.cardSet = vnode.attrs.cardSet;
    this._channel = vnode.attrs.channel;
  }

  public buttonSaveHandler() {
    this.cardSet.name = this.cardSet.name.trim();

    if (isEmptyString(this.cardSet.name)) {
      Swal.fire({
        icon: 'warning',
        title: 'Please, provide a card set name',
      });
      return;
    }

    if (this._channel.cards.find((item) => item.name === this.cardSet.name && item.id !== this.cardSet.id)) {
      Swal.fire(`Card set "${this.cardSet.name}" already exists`, '', 'warning');
      return;
    }

    this.close(this.cardSet);
    m.redraw();
  }

  public view() {
    return template.call(this);
  }
}
