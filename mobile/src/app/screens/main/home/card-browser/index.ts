import { CardBaseScreen } from '../card-base';
import { api } from '../../../../services/api';
import { IBrowserCard } from '../../../../../../../common/common';
import { template } from './template';

export class CardBrowserScreen extends CardBaseScreen {
  public clicked = false;

  public newCardHandler() {
    api.submitCardView(this.card);
  }

  public view() {
    return template.call(this);
  }

  public clickCard(): void {
    this.clicked = true;
  }

  public get card(): IBrowserCard {
    return this._card as IBrowserCard;
  }
}
