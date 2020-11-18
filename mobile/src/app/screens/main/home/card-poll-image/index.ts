import { redraw } from 'mithril';

import { IImagePollCard, IPollParticipation } from '../../../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { api } from '../../../../services/api';
import { PARTICIPATION_REFRESH_TIME } from '../../../../utils';
import { CardBaseScreen } from '../card-base';
import { template } from './template';

export class CardPollImageScreen extends CardBaseScreen {
  private _answer: number;
  private _isSubmitted: boolean;
  private _percentage: number[] = [];
  private _timer: number;

  public async newCardHandler() {
    clearTimeout(this._timer);
    const answer = await api.getPollCardAnswer(this.card);
    this._isSubmitted = false;
    this._answer = undefined;
    this._percentage = [];

    if (!isEmptyString(answer)) {
      this._answer = parseInt(answer);
      this._isSubmitted = true;
    }

    if (this._isSubmitted) {
      this.showPercentage();
    }

    redraw();
  }

  public answerSelectHandler(value: number) {
    this._answer = value;
  }

  public async buttonSubmitHandler() {
    this._isSubmitted = true;
    await api.submitPollCardAnswer(this.card, this._answer.toString());
    api.writeAction(this._card.id, 'answer', this._answer);
    await this.showPercentage();
  }

  private async showPercentage() {
    if (!this._isSubmitted || this._destroyed) {
      return;
    }

    clearTimeout(this._timer);
    const participation: IPollParticipation = (await api.getParticipation(this._card, true)) as IPollParticipation;

    if (!this._isSubmitted || this._destroyed) {
      return;
    }

    this._percentage = this.card.answers.map(() => 0);

    if (participation.total !== 0) {
      for (const index in participation.answers) {
        this._percentage[index] = Math.round((100 * participation.answers[index]) / participation.total);
      }
    }

    this._timer = window.setTimeout(this.showPercentage.bind(this), PARTICIPATION_REFRESH_TIME);
    redraw();
  }

  public onremove() {
    clearTimeout(this._timer);
    super.onremove();
  }

  public view() {
    return template.call(this);
  }

  public get card(): IImagePollCard {
    return this._card as IImagePollCard;
  }

  public get answer(): number {
    return this._answer;
  }

  public get isSubmitted(): boolean {
    return this._isSubmitted;
  }

  public get percentage() {
    return this._percentage;
  }
}
