import { BaseLiveCardService } from './BaseLiveCardService';
import { ICard, IState, isTimelineChannel } from '../../common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

const THRESHOLD = 200;

export class TimelineCardService extends BaseLiveCardService {
  private _isPlaying: boolean;
  private _cards: ICard[];
  private _timerFrame: number;
  private _startTime: number;

  protected stateHandler(value: IState) {
    if (isEmptyString(value.sid) || !isTimelineChannel(value.channel)) {
      this._isPlaying = false;
      this._subject.next();
      this._card = undefined;
      cancelAnimationFrame(this._timerFrame);
      return;
    }

    this._cards = value.channel.timeline.cards;

    if (value.pausedTime) {
      this._isPlaying = false;
      this._startTime = this._api.time() - (value.pausedTime - value.startTime);
      this.frameHandler();
      return;
    }

    this._isPlaying = true;
    this._startTime = value.startTime;
    cancelAnimationFrame(this._timerFrame);
    this._timerFrame = requestAnimationFrame(this.frameHandler.bind(this));
  }

  private frameHandler() {
    if (!this._api) {
      return;
    }

    const position = this._api.time() - this._startTime;
    this._subjectPosition.next(position);
    const card: ICard = this._cards.find(
      (item) => item.startTime - THRESHOLD <= position && item.startTime + item.stopTimer + THRESHOLD >= position,
    );

    if (card?.id !== this._card?.id) {
      this._card = card;
      this._subject.next(card);
    }

    if (this._isPlaying) {
      this._timerFrame = requestAnimationFrame(this.frameHandler.bind(this));
    }
  }

  public get paused(): boolean {
    return !this._isPlaying;
  }
}
