import { ClassComponent } from 'mithril';
import { template } from './template';
import { liveCard } from '../../services/live-card';
import { Unsubscribable } from 'rxjs';
import { IState } from '../../../../../common/common';
import { api } from '../../services/api';

export class PauseOverlay implements ClassComponent {
  public unsynced: boolean;
  public online: boolean;
  private readonly _subscription: Unsubscribable = api.state.subscribe(this.stateHandler.bind(this));

  private stateHandler(value: IState) {
    this.unsynced = !value?.channel?.synced;
    this.online = value?.channel?.online;
  }

  public buttonPlayHandler() {
    liveCard.play();
  }

  public onremove() {
    this._subscription.unsubscribe();
  }

  public view() {
    return template.call(this);
  }
}
