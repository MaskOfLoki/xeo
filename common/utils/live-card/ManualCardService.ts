import { BaseLiveCardService } from './BaseLiveCardService';
import { IState, isTimelineChannel, CardStatus, CardStopMode, ICard, IParticipation } from '../../common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export class ManualCardService extends BaseLiveCardService {
  private _timerId: number;
  private _stateStartTime: number;

  protected async stateHandler(value: IState) {
    if (isEmptyString(value.sid) || isTimelineChannel(value.channel)) {
      this._subject.next();
      this._card = undefined;
      clearTimeout(this._timerId);
      this._timerId = undefined;
      return;
    }

    this._stateStartTime = value.startTime;

    const position = this._api.time() - value.startTime;
    this._subjectPosition.next(position);

    let card = value.channel?.cards.find((item) => item.status === CardStatus.LIVE);

    if (await this.isCardDone(card)) {
      card = undefined;
    }

    this._card = card;
    this._subject.next(card);

    if (
      this._card?.status === CardStatus.LIVE &&
      (this._card?.stopMode === CardStopMode.AUTO || this._card?.stopMode === CardStopMode.CENSUS)
    ) {
      if (!this._timerId) {
        this._timerId = setTimeout(this.tickHandler.bind(this));
      }
      return;
    }

    if (this._timerId) {
      clearTimeout(this._timerId);
      this._timerId = undefined;
    }
  }

  private async isCardDone(card: ICard): Promise<boolean> {
    if (!card || !this._api) {
      return true;
    }

    if (card.status !== CardStatus.LIVE) {
      return true;
    }

    if (card.stopMode === CardStopMode.MANUAL) {
      return false;
    }

    if (card.stopMode === CardStopMode.AUTO) {
      const now = this._api.time();
      const timer = Math.floor((card.stopTimer + card.startTime + this._stateStartTime - now) * 0.001);
      return timer <= 0;
    }

    if (card.stopMode === CardStopMode.CENSUS) {
      const participation: IParticipation = await this._api.getParticipation(card, this._channelId);
      return participation.total >= card.stopCensus;
    }
  }

  private async tickHandler() {
    if (await this.isCardDone(this._card)) {
      this._timerId = undefined;
      this._card = undefined;
      this._subject.next();
      return;
    }

    this._timerId = window.setTimeout(this.tickHandler.bind(this), 1000);
  }
}
