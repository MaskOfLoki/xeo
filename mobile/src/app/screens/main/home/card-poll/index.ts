import { redraw } from 'mithril';

import { IPollParticipation, ITextPollCard, PollType } from '../../../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { api } from '../../../../services/api';
import { PARTICIPATION_REFRESH_TIME, swalAlert } from '../../../../utils';
import { CardBaseScreen } from '../card-base';
import { template } from './template';
import { filterService } from '../../../../services/FilterService';

export class CardPollScreen extends CardBaseScreen {
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

  public answerSelectHandler(value: string) {
    this._answer = value;
  }

  public inputChangeHandler(value: string) {
    this._answer = value;
  }

  public async buttonSubmitHandler() {
    if (this.card.pollType === PollType.OPEN_RESPONSE && !this.validateAnswer()) {
      return;
    }

    this._isSubmitted = true;
    await api.submitPollCardAnswer(this.card, this._answer);
    api.writeAction(this._card.id, 'answer', this._answer);
    this.showPercentage();
  }

  private async validateAnswer(): Promise<boolean> {
    let isValid = true;

    if (!(await filterService.isCleanChat(this._answer))) {
      isValid = false;
      swalAlert({
        icon: 'warning',
        text: 'Please submit a family friendly answer',
      });
    }

    return isValid;
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
        const index = this.card.answers.findIndex((item) => item === answer);
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

  public get card(): ITextPollCard {
    return this._card as ITextPollCard;
  }

  public get answer(): string {
    return this._answer;
  }

  public get isSubmitted(): boolean {
    return this._isSubmitted;
  }

  public get percentage() {
    return this._percentage;
  }
}
