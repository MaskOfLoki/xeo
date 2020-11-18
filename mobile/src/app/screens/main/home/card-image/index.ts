import { IImageCard } from '../../../../../../../common/common';
import { CardBaseScreen } from '../card-base';
import { api } from '../../../../services/api';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { orientation } from '../../../../services/OrientationService';

import { template } from './template';

export class CardImageScreen extends CardBaseScreen {
  public newCardHandler() {
    api.submitCardView(this.card);
  }

  public clickHandler() {
    if (isEmptyString(this.card.url)) {
      return;
    }

    api.writeAction(this._card.id, 'open_link');

    if (this.card.url.startsWith('http') || this.card.url.startsWith('https')) {
      window.open(this.card.url, '_blank');
    } else {
      window.open('http://' + this.card.url, '_blank');
    }
  }

  public async buttonShareHandler() {
    try {
      await navigator['share']({
        title: 'XEO',
        text: this.card.message,
        url: this.image,
      });
      api.awardSocialSharing(this.card);

      api.writeAction(this._card.id, 'shared');
    } catch (e) {
      // sharing was cancelled
    }
  }

  public view() {
    return template.call(this);
  }

  public get card(): IImageCard {
    return this._card as IImageCard;
  }

  public get image(): string {
    return this.card.imagePortrait;
  }
}
