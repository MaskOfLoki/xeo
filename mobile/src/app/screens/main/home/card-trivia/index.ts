import { redraw } from 'mithril';

import { IPollParticipation, ITriviaAnswer, ITriviaCard } from '../../../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { api } from '../../../../services/api';
import { PARTICIPATION_REFRESH_TIME } from '../../../../utils';
import { CardBaseScreen } from '../card-base';
import { template } from './template';

export class CardTriviaScreen extends CardBaseScreen {
  private _answer: string;
  private _isSubmitted: boolean;
  private _percentage: number[] = [];
  private _timer: number;

  public async newCardHandler() {
    clearTimeout(this._timer);
    this._answer = await api.getPollCardAnswer(this.card);
    this._percentage = [];
    this._isSubmitted = !isEmptyString(this._answer);

    if (this._isSubmitted) {
      this.showPercentage();
    }

    redraw();
  }

  public answerSelectHandler({ value }: ITriviaAnswer) {
    this._answer = value;
  }

  public async buttonSubmitHandler() {
    this._isSubmitted = true;
    await api.submitPollCardAnswer(this.card, this._answer);
    api.writeAction(this._card.id, 'answer', this._answer);
    this.showPercentage();
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
      for (const answer in participation.answers) {
        const index = this.card.answers.findIndex((item) => item.value === answer);
        this._percentage[index] = Math.round((100 * participation.answers[answer]) / participation.total);
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

  public get card(): ITriviaCard {
    return this._card as ITriviaCard;
  }

  public get answer(): string {
    return this._answer;
  }

  public get isSubmitted() {
    return this._isSubmitted;
  }

  public get percentage() {
    return this._percentage;
  }
}
