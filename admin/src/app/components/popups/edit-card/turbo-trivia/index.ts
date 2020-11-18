import { BaseEdit, IBaseEditAttrs } from '../base';
import { template } from './template';
import { redraw, Vnode } from 'mithril';
import Swal from 'sweetalert2';
import { IntegratedGame, ITurboTriviaCard } from '../../../../../../../common/common';
import {
  DEFAULT_INTERMISSION_COUNTDOWN,
  DEFAULT_REVEAL_COUNTDOWN,
  ISlot,
  ITurboTriviaState,
} from '../../../../../common/turbo-trivia-2';
import { Unsubscribable } from 'rxjs';
import { api } from '../../../../services/api';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { TurboTriviaPlayMode } from '../../../../../../../common/common';

export const PlayModes = [
  { mode: TurboTriviaPlayMode.MANUAL, title: 'Manual' },
  { mode: TurboTriviaPlayMode.AUTO_DRIVE, title: 'Auto Drive' },
  { mode: TurboTriviaPlayMode.FREE_PLAY, title: 'Free Play' },
];

export class EditTurboTrivia extends BaseEdit {
  private _triviaSubscription: Unsubscribable;
  public triviaState: ITurboTriviaState;
  public triviaSlots: ISlot[];

  public oninit(vnode): void {
    super.oninit(vnode);

    if (!this.card.timers) {
      this.card.timers = {
        revealTimer: DEFAULT_REVEAL_COUNTDOWN * 1000,
        intermissionTimer: DEFAULT_INTERMISSION_COUNTDOWN * 1000,
      };
    }

    this.getTriviaSlots();
    this._triviaSubscription = api.turbotrivia.state('').subscribe(this.stateHandler.bind(this));
    this.card.game = IntegratedGame.TURBO_TRIVIA_2;

    if (this.card.mode === undefined || this.card.mode === null) {
      this.card.mode = TurboTriviaPlayMode.MANUAL;
    }
  }

  public async getTriviaSlots() {
    this.triviaSlots = await api.turbotrivia.getSlots();
    if (this.triviaSlots.length > 0 && isEmptyString(this.card.slot)) {
      this.card.slot = this.triviaSlots[0].id;
    }

    redraw();
  }

  public slotChangeHandler(slotID: string) {
    this.card.slot = this.triviaSlots.find((slot) => slot.id === slotID).id;
  }

  public modeChangeHandler(mode: TurboTriviaPlayMode) {
    this.card.mode = mode;
  }

  public stateHandler(state: ITurboTriviaState) {
    this.triviaState = state;
    redraw();
  }

  public validate(): boolean {
    if (!this.card.slot) {
      Swal.fire(`Please select slot`, '', 'warning');
      return false;
    }

    if (!this.card.mode) {
      Swal.fire(`Please select mode`, '', 'warning');
      return false;
    }

    return true;
  }

  public view({ attrs }: Vnode<IBaseEditAttrs>) {
    return template.call(this, attrs);
  }

  public get card(): ITurboTriviaCard {
    return this._card as ITurboTriviaCard;
  }

  public set revealCountDownSeconds(value: number) {
    if (value > 59) {
      return;
    }

    this.card.timers.revealTimer = this.revealCountDownMinutes * 60000 + value * 1000;
  }

  public get revealCountDownSeconds(): number {
    return Math.floor((this.card.timers.revealTimer - this.revealCountDownMinutes * 60000) * 0.001);
  }

  public set revealCountDownMinutes(value: number) {
    if (value > 99) {
      return;
    }

    this.card.timers.revealTimer = value * 60000 + this.revealCountDownSeconds * 1000;
  }

  public get revealCountDownMinutes(): number {
    return Math.floor(this.card.timers.revealTimer / 60000);
  }

  public set intermissionCountDownSeconds(value: number) {
    if (value > 59) {
      return;
    }

    this.card.timers.intermissionTimer = this.intermissionCountDownMinutes * 60000 + value * 1000;
  }

  public get intermissionCountDownSeconds(): number {
    return Math.floor((this.card.timers.intermissionTimer - this.intermissionCountDownMinutes * 60000) * 0.001);
  }

  public set intermissionCountDownMinutes(value: number) {
    if (value > 99) {
      return;
    }

    this.card.timers.intermissionTimer = value * 60000 + this.intermissionCountDownSeconds * 1000;
  }

  public get intermissionCountDownMinutes(): number {
    return Math.floor(this.card.timers.intermissionTimer / 60000);
  }

  public openAdmin() {
    const nextDeployStack = window.location.pathname.includes('next') ? 'next/' : '';
    const GAME_ID = 'turbo-trivia-2';
    window.open(
      GC_PRODUCTION ? `${window.location.origin}/${nextDeployStack}${GAME_ID}/admin?xeo` : 'http://localhost:8090?xeo',
    );
  }

  public onremove() {
    super.onremove();
    if (this._triviaSubscription) {
      this._triviaSubscription.unsubscribe();
    }
  }
}
