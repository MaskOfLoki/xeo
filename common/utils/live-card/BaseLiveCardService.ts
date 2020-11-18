import { Unsubscribable, Subject, BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { IAPIService } from '..';
import { ICard, IState } from '../../common';

export abstract class BaseLiveCardService {
  protected _subject: Subject<ICard> = new BehaviorSubject(undefined);
  protected _card: ICard;

  private readonly _stateSubscription: Unsubscribable;
  protected readonly _subjectPosition: Subject<number> = new ReplaySubject(1);

  public readonly position: Observable<number> = this._subjectPosition;

  constructor(protected _api: IAPIService, protected _channelId: string) {
    const state: Observable<IState> = typeof _api.state === 'function' ? _api.state(_channelId) : _api.state;
    this._stateSubscription = state.subscribe(this.stateHandler.bind(this));
  }

  protected abstract stateHandler(value: IState);

  public subscribe(callback: (value: ICard) => void): Unsubscribable {
    return this._subject.subscribe(callback);
  }

  public destroy() {
    this._stateSubscription.unsubscribe();
    this._api = undefined;
  }

  public get(): ICard {
    return this._card;
  }

  public get paused(): boolean {
    return false;
  }
}
