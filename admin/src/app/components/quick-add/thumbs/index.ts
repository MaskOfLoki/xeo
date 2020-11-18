import { template } from './template';
import Swal from 'sweetalert2';
import { Vnode } from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { IThumbsCard } from '../../../../../../common/common';
import { BaseEdit, IBaseEditAttrs } from '../../popups/edit-card/base';

export class QuickAddThumbs extends BaseEdit {
  public validate(): boolean {
    this.card.header = this.card.header?.trim();

    if (isEmptyString(this.card.header)) {
      Swal.fire(`Please provide card's headline`, '', 'warning');
      return false;
    }

    this.card.message = this.card.message?.trim();

    if (isEmptyString(this.card.message)) {
      Swal.fire(`Please provide card's sub headline`, '', 'warning');
      return false;
    }

    return true;
  }

  public view({ attrs }: Vnode<IBaseEditAttrs>) {
    return template.call(this, attrs);
  }

  public get card(): IThumbsCard {
    return this._card as IThumbsCard;
  }
}
