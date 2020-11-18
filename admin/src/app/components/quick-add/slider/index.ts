import { template } from './template';
import Swal from 'sweetalert2';
import { Vnode } from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { ISliderCard } from '../../../../../../common/common';
import { BaseEdit, IBaseEditAttrs } from '../../popups/edit-card/base';

const DEFAULT_LABELS = ['Totally Agree', 'Agree', 'Neutral', 'Not Sure', 'Disagree'];

export class QuickAddSlider extends BaseEdit {
  public oninit(vnode: Vnode<IBaseEditAttrs>) {
    super.oninit(vnode);

    if (!this.card.labels) {
      this.card.labels = [];
    }

    DEFAULT_LABELS.forEach((item, index) => {
      if (isEmptyString(this.card.labels[index])) {
        this.card.labels[index] = item;
      }
    });
  }

  public validate(): boolean {
    if (this.card.labels.some((item) => isEmptyString(item))) {
      Swal.fire('Please, fill in all labels', '', 'warning');
      return false;
    }

    return true;
  }

  public view({ attrs }: Vnode<IBaseEditAttrs>) {
    return template.call(this, attrs);
  }

  public get card(): ISliderCard {
    return this._card as ISliderCard;
  }
}
