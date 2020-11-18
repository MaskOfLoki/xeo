import { template } from './template';
import m, { ClassComponent, redraw, Vnode } from 'mithril';
import { IChannel } from '../../../../../../../../../common/common';
import { api } from '../../../../../../services/api';
import {
  DEFAULT_INTERMISSION_COUNTDOWN,
  DEFAULT_REVEAL_COUNTDOWN,
  ISlot,
} from '../../../../../../../common/turbo-trivia-2';
import { Unsubscribable } from 'rxjs';
import { ITurboTriviaState } from '../../../../../../../common/turbo-trivia-2';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { IValidateResult } from '../../../../../../services/api/turbo-trivia/APITurboTriviaService';

export interface IConfigGameSettingsAttrs {
  config: any;
  channel?: IChannel;
}

export class CustomGameSettings implements ClassComponent<IConfigGameSettingsAttrs> {
  private _subscription: Unsubscribable;
  private _gameConfig: any;
  private _channel: IChannel;
  public triviaSlots: ISlot[];
  public triviaSlot: ISlot;
  public triviaState: ITurboTriviaState;
  public triviaStarted = false;

  public oncreate(vnode: Vnode<IConfigGameSettingsAttrs>): void {
    this.onbeforeupdate(vnode);
    this.getTriviaSlots();
    this._subscription = api.turbotrivia.state('').subscribe(this.stateHandler.bind(this));
  }

  public onbeforeupdate({ attrs }: Vnode<IConfigGameSettingsAttrs>) {
    this._channel = attrs.channel;
    if (!this._gameConfig || this._gameConfig.prefix !== attrs.config.prefix) {
      this._gameConfig = attrs.config;
      m.redraw();
    }
  }

  public stateHandler(state: ITurboTriviaState) {
    this.triviaState = state;
    redraw();
  }

  public slotChangeHandler(slotID: string) {
    this.triviaSlot = this.triviaSlots.find((slot) => slot.id === slotID);
  }

  public async getTriviaSlots() {
    this.triviaSlots = await api.turbotrivia.getSlots();
    if (this.triviaSlots.length > 0) {
      this.triviaSlot = this.triviaSlots[0];
    }
    redraw();
  }

  public view(): Vnode<IConfigGameSettingsAttrs> {
    return template.call(this);
  }

  public get gameConfig(): any {
    return this._gameConfig;
  }

  public get channel(): IChannel {
    return this._channel;
  }

  public async activateHandler() {
    if (isEmptyString(this.triviaState?.sid)) {
      const error: IValidateResult = await api.turbotrivia.validateGame(
        this.triviaSlot.id,
        false,
        true,
        DEFAULT_REVEAL_COUNTDOWN,
        DEFAULT_INTERMISSION_COUNTDOWN,
      );

      if (!isEmptyString(error.result)) {
        Swal.fire({
          title: error.result,
          icon: 'warning',
        });
        return;
      }

      api.turbotrivia.publishGame(
        this.triviaSlot.data,
        true,
        false,
        DEFAULT_REVEAL_COUNTDOWN,
        DEFAULT_INTERMISSION_COUNTDOWN,
      );
    } else {
      api.turbotrivia.resetActive();
    }
  }

  public remove() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}
