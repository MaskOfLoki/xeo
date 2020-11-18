import { BaseLiveCardService } from './BaseLiveCardService';
import { Unsubscribable } from 'rxjs';
import { ManualCardService } from './ManualCardService';
import { TimelineCardService } from './TimelineCardService';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { isTimelineChannel, IState } from '../../common';

export class CombinedLiveCardService extends BaseLiveCardService {
  private _instance: BaseLiveCardService;
  private _subscriptions: Unsubscribable[];

  protected stateHandler(value: IState) {
    if (isEmptyString(value.sid)) {
      this._card = undefined;
      this._subject.next();
      this.unsubscribe();
      return;
    }

    if (isTimelineChannel(value.channel)) {
      this.createService(TimelineCardService);
    } else {
      this.createService(ManualCardService);
    }
  }

  protected unsubscribe() {
    if (this._subscriptions) {
      this._subscriptions.forEach((item) => item.unsubscribe());
    }

    this._subscriptions = [];

    if (this._instance) {
      this._instance.destroy();
      this._instance = undefined;
    }
  }

  private createService(cls) {
    if (this._instance instanceof cls) {
      return;
    }

    this.unsubscribe();
    this._instance = new cls(this._api, this._channelId);
    this._subscriptions.push(
      this._instance.subscribe((value) => this._subject.next(value)),
      this._instance.position.subscribe(this._subjectPosition),
    );
  }

  public get paused(): boolean {
    return this._instance?.paused;
  }
}
