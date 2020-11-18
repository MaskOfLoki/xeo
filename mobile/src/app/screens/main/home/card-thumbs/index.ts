import { redraw } from 'mithril';

import { CardType, ICard, IThumbsCard, IThumbsParticipation } from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import { PARTICIPATION_REFRESH_TIME } from '../../../../utils';
import { CardBaseScreen } from '../card-base';

import { template } from './template';

export class CardThumbsScreen extends CardBaseScreen {
  private _isUp: boolean;
  private _percentage: number;
  private _timerRefreshPercentage: number;

  protected cardHandler(value: ICard) {
    super.cardHandler(value);

    if (value?.type !== CardType.REACTION_THUMBS) {
      return;
    }

    if (!this.card.images) {
      this.card.images = {};
    }

    if (!this.card.images.up) {
      this.card.images.up = 'assets/images/cards/thumbs/up.svg';
    }

    if (!this.card.images.down) {
      this.card.images.down = 'assets/images/cards/thumbs/down.svg';
    }
  }

  public async newCardHandler() {
    this._isUp = await api.getThumbsCardAnswer(this._card);
    this.refreshPercentage();
  }

  public async buttonUpHandler() {
    this._isUp = true;
    await api.submitThumbsCardAnswer(this._card, this._isUp);
    api.writeAction(this._card.id, 'thumbs', this._isUp);
    this.refreshPercentage();
  }

  public async buttonDownHandler() {
    this._isUp = false;
    await api.submitThumbsCardAnswer(this._card, this._isUp);
    api.writeAction(this._card.id, 'thumbs', this._isUp);
    this.refreshPercentage();
  }

  private async refreshPercentage() {
    if (this._destroyed || !this._card) {
      return;
    }

    clearTimeout(this._timerRefreshPercentage);
    const participation: IThumbsParticipation = (await api.getParticipation(this._card, true)) as IThumbsParticipation;

    if (participation.total === 0) {
      this._percentage = 0;
    } else {
      this._percentage = Math.round((100 * participation.up) / participation.total);
    }

    redraw();
    this._timerRefreshPercentage = window.setTimeout(this.refreshPercentage.bind(this), PARTICIPATION_REFRESH_TIME);
  }

  public view() {
    return template.call(this);
  }

  public onremove() {
    super.onremove();
    clearTimeout(this._timerRefreshPercentage);
  }

  public get isUp(): boolean {
    return this._isUp;
  }

  public get card(): IThumbsCard {
    return this._card as IThumbsCard;
  }

  public get percentage(): number {
    return this._percentage;
  }
}
