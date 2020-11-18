import { liveCard as commonLiveCard } from '../../../../../common/utils/live-card';
import { api } from '../api';
import { Subject, BehaviorSubject, Unsubscribable, ReplaySubject, Observable } from 'rxjs';
import {
  ICard,
  IState,
  isTimelineChannel,
  ITargetCard,
  CardType,
  TargetType,
  IMultipleChoiceSignupField,
  IUser,
  IImagePollCard,
  ISliderCard,
} from '../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { getChannel } from '../../../../../common/utils/query';
import { toPromise } from '../../utils';
import { SLIDER_DIVISIONS } from '../../../../../common/constants/cards';

const THRESHOLD = 200;

export class MobileLiveCardService {
  private _subjectPosition: Subject<number> = new ReplaySubject(1);
  private _subject: Subject<ICard> = new BehaviorSubject(undefined);
  private _subscriptions: Unsubscribable[];
  private _initialized: boolean;
  private _timerFrame: number;
  private _isPlaying: boolean;
  private _cards: ICard[];
  private _card: ICard;
  private _savedPosition: number;
  private _position: number;
  private _positionUpdateTime: number;
  private _frameHandler: VoidFunction = this.frameHandler.bind(this);
  private _isUnsynced: boolean;
  private _sid: string;
  private _targetCardId: number;

  public readonly position: Observable<number> = this._subjectPosition;

  constructor() {
    api.state.subscribe(this.stateHandler.bind(this));
  }

  protected stateHandler(value: IState) {
    if (!isEmptyString(value.sid) && isTimelineChannel(value.channel) && !value.channel.synced) {
      this.unsubscribe();
      this.unsyncedStateHandler(value);
      return;
    }

    this.stopUnsync();

    if (!this._initialized) {
      this._initialized = true;
      commonLiveCard.init(api as any);
    }

    if (!this._subscriptions || this._subscriptions.length === 0) {
      this._subscriptions = [
        commonLiveCard.subscribe(this.switchCard.bind(this), getChannel()),
        commonLiveCard.position.subscribe(this._subjectPosition),
      ];
    }
  }

  private async switchCard(value: ICard) {
    if (value?.type === CardType.TARGET) {
      this._targetCardId = value.id;
      value = await this.processTargetCard(value as ITargetCard);
    } else {
      this._targetCardId = undefined;
    }

    this._card = value;
    this._subject.next(value);
  }

  private unsyncedStateHandler(value: IState) {
    if (this._sid !== value.sid) {
      this._sid = value.sid;
      this._isPlaying = false;
    }

    this._cards = value.channel?.timeline?.cards ?? [];
    this.startUnsync();
  }

  private async startUnsync() {
    this._isUnsynced = true;

    if (this._isPlaying) {
      return;
    }

    const status = await api.getSessionPlaybackStatus();

    this._isPlaying = !status.paused;
    this._position = this._savedPosition = status.position;
    this._subjectPosition.next(this._position);
    this._positionUpdateTime = api.time();
    this.frameHandler();
  }

  private stopUnsync() {
    this._isUnsynced = false;

    if (!this._isPlaying) {
      return;
    }

    this._isPlaying = false;
    cancelAnimationFrame(this._timerFrame);
  }

  private async frameHandler() {
    const now = api.time();
    this._position += now - this._positionUpdateTime;
    this._subjectPosition.next(this._position);
    this._positionUpdateTime = now;

    const card: ICard = this._cards.find(
      (item) =>
        item.startTime - THRESHOLD <= this._position && item.startTime + item.stopTimer + THRESHOLD >= this._position,
    );

    let needSavePosition = false;

    // save current position if card has changed or 10 seconds after last update
    if ((this._targetCardId == null || this._targetCardId !== card?.id) && card?.id !== this._card?.id) {
      await this.switchCard(card);
      needSavePosition = true;
    } else if (this._position - this._savedPosition > 10000) {
      needSavePosition = true;
    }

    if (needSavePosition) {
      this._savedPosition = this._position;
      await api.updateSessionPosition(this._position);
    }

    if (this._isPlaying) {
      this._timerFrame = requestAnimationFrame(this._frameHandler);
    }
  }

  private async processTargetCard(value: ITargetCard): Promise<ICard> {
    let relation: string;

    if (value.targetType === TargetType.SIGNUP) {
      const field: IMultipleChoiceSignupField = value.target as IMultipleChoiceSignupField;
      const user: IUser = await toPromise(api.user);
      relation = user[field.name];
    } else if (value.targetType === TargetType.CARD) {
      const card: ICard = value.target as ICard;

      switch (card.type) {
        case CardType.REACTION_THUMBS: {
          const isUp = await api.getThumbsCardAnswer(card);

          if (isUp == null) {
            return;
          }

          relation = isUp ? 'UP' : 'DOWN';
          break;
        }
        case CardType.TRIVIA:
        case CardType.POLL: {
          relation = await api.getPollCardAnswer(card);
          break;
        }
        case CardType.TRIVIA_IMAGE:
        case CardType.POLL_IMAGE: {
          const answer = await api.getPollCardAnswer(card);
          const c: IImagePollCard = card as IImagePollCard;
          relation = c.answers[answer]?.url;
          break;
        }
        case CardType.REACTION_SLIDER: {
          const c: ISliderCard = card as ISliderCard;
          const answer: number = await api.getSliderCardValue(card);
          const value = Math.floor(answer / SLIDER_DIVISIONS);
          relation = c.labels[value];
          break;
        }
      }
    }

    if (relation == null) {
      return;
    }

    return value.entries.find((item) => item.relation === relation)?.card;
  }

  private unsubscribe() {
    if (this._subscriptions) {
      this._subscriptions.forEach((item) => item.unsubscribe());
    }

    this._subscriptions = [];
  }

  public subscribe(callback: (value: ICard) => void): Unsubscribable {
    return this._subject.subscribe(callback);
  }

  public pause() {
    if (!this._isPlaying || !this._isUnsynced) {
      return;
    }

    this._isPlaying = false;
    api.toggleSessionPlayback(false);
    cancelAnimationFrame(this._timerFrame);
  }

  public play() {
    if (this._isPlaying || !this._isUnsynced) {
      return;
    }

    this._isPlaying = true;
    api.toggleSessionPlayback(true);
    this._positionUpdateTime = api.time();
    this.frameHandler();
  }

  public get(): ICard {
    return this._card;
  }

  public getPosition(): number {
    return this._position;
  }

  public get paused(): boolean {
    return this._isUnsynced ? this._isPlaying === false : commonLiveCard.getPaused(getChannel());
  }
}

export const liveCard: MobileLiveCardService = new MobileLiveCardService();
