import { BaseEdit, IBaseEditAttrs } from '../base';
import { template } from './template';
import { Vnode } from 'mithril';
import Swal from 'sweetalert2';
import { IntegratedGame, IQBTossCard } from '../../../../../../../common/common';

const SPLASH_SCREEN_TIMER_DEFAULT = 60000;
const GAME_START_TIMER_DEFAULT = 10000;
const GAME_TIME_DEFAULT = 30000;

// The number of milliseconds in a minute.
const MINUTES_TO_MILLISECONDS = 60000;

export class EditQBToss extends BaseEdit {
  public oninit(vnode): void {
    super.oninit(vnode);

    if (!this.card.colors) {
      this.card.colors = {};
    }

    if (!this.card.images) {
      this.card.images = {};
    }

    if (!this.card.timers) {
      this.card.timers = {
        splashScreen: SPLASH_SCREEN_TIMER_DEFAULT,
        gameStart: GAME_START_TIMER_DEFAULT,
        game: GAME_TIME_DEFAULT,
      };
    }

    this.card.game = IntegratedGame.QB_TOSS;
  }

  public validate(): boolean {
    const sumOfTimers = this.card.timers.gameStart + this.card.timers.game + this.card.timers.splashScreen;

    if (sumOfTimers > this._card.stopTimer) {
      Swal.fire(`The Countdown timers must be shorter than the card timer`, '', 'warning');
      return false;
    }

    return true;
  }

  public view({ attrs }: Vnode<IBaseEditAttrs>) {
    return template.call(this, attrs);
  }

  public get card(): IQBTossCard {
    return this._card as IQBTossCard;
  }

  public set splashScreenSeconds(value: number) {
    if (value > 59) {
      return;
    }

    this.card.timers.splashScreen = this.splashScreenMinutes * MINUTES_TO_MILLISECONDS + value * 1000;
  }

  public get splashScreenSeconds(): number {
    return Math.floor((this.card.timers.splashScreen - this.splashScreenMinutes * 60000) * 0.001);
  }

  public set splashScreenMinutes(value: number) {
    if (value > 99) {
      return;
    }

    this.card.timers.splashScreen = value * 60000 + this.splashScreenSeconds * 1000;
  }

  public get splashScreenMinutes(): number {
    return Math.floor(this.card.timers.splashScreen / 60000);
  }

  public set gameStartSeconds(value: number) {
    if (value > 59) {
      return;
    }

    this.card.timers.gameStart = this.gameStartMinutes * 60000 + value * 1000;
  }

  public get gameStartSeconds(): number {
    return Math.floor((this.card.timers.gameStart - this.gameStartMinutes * 60000) * 0.001);
  }

  public set gameStartMinutes(value: number) {
    if (value > 99) {
      return;
    }

    this.card.timers.gameStart = value * 60000 + this.gameStartSeconds * 1000;
  }

  public get gameStartMinutes(): number {
    return Math.floor(this.card.timers.gameStart / 60000);
  }

  public set gameSeconds(value: number) {
    if (value > 59) {
      return;
    }

    this.card.timers.game = this.gameMinutes * 60000 + value * 1000;
  }

  public get gameSeconds(): number {
    return Math.floor((this.card.timers.game - this.gameMinutes * 60000) * 0.001);
  }

  public set gameMinutes(value: number) {
    if (value > 99) {
      return;
    }

    this.card.timers.game = value * 60000 + this.gameSeconds * 1000;
  }

  public get gameMinutes(): number {
    return Math.floor(this.card.timers.game / 60000);
  }
}
