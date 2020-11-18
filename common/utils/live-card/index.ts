import { IAPIService } from '..';
import { CombinedLiveCardService } from './CombinedLiveCardService';
import { ICard } from '../../common';
import { Subject, ReplaySubject, Observable } from 'rxjs';

export class LiveCardService {
  private _api: IAPIService;
  private _instances: Map<string, CombinedLiveCardService> = new Map();
  private readonly _subjectPosition: Subject<number> = new ReplaySubject(1);
  public readonly position: Observable<number> = this._subjectPosition;

  public init(api: IAPIService) {
    this._api = api;
  }

  public subscribe(callback: (card: ICard) => void, channelId: string) {
    let instance: CombinedLiveCardService = this._instances.get(channelId);

    if (!instance) {
      instance = new CombinedLiveCardService(this._api, channelId);
      instance.position.subscribe(this._subjectPosition);
      this._instances.set(channelId, instance);
    }

    return instance.subscribe(callback);
  }

  public get(channelId: string): ICard {
    const instance: CombinedLiveCardService = this._instances.get(channelId);

    if (instance) {
      return instance.get();
    }

    return undefined;
  }

  public getPaused(channelId: string): boolean {
    return this._instances.get(channelId)?.paused;
  }
}

export const liveCard: LiveCardService = new LiveCardService();
