import { template } from './template';
import { BaseEdit, IBaseEditAttrs } from '../base';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { Vnode } from 'mithril';
import { IApplauseCard } from '../../../../../../../common/common';
import { GradientDirection, GradientType } from '../../../../../../../common/types/Gradients';

export class EditApplause extends BaseEdit {
  public validate(): boolean {
    if (isEmptyString(this.card.header)) {
      Swal.fire(`Please provide card's headline`, '', 'warning');
      return false;
    }

    if (isEmptyString(this.card.message)) {
      Swal.fire(`Please provide card's sub headline`, '', 'warning');
      return false;
    }

    return true;
  }

  public view({ attrs }: Vnode<IBaseEditAttrs>) {
    return template.call(this, attrs);
  }

  public get card(): IApplauseCard {
    return this._card as IApplauseCard;
  }

  protected defaultColors() {
    return {
      clapIcon: '#01ECFC',
      clapBackground: {
        type: GradientType.Circular,
        direction: GradientDirection.FromCenter,
        steps: [
          {
            color: '#0B2D47',
            position: 0,
          },
          {
            color: '#00011F',
            position: 50,
          },
        ],
      },
    };
  }
}
