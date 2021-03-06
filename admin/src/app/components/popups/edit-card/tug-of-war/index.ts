import { BaseEdit, IBaseEditAttrs } from '../base';
import { template } from './template';
import { Vnode } from 'mithril';
import Swal from 'sweetalert2';
import { IntegratedGame, ITugOfWarCard } from '../../../../../../../common/common';

const SPLASH_SCREEN_TIMER_DEFAULT = 60000;
const GAME_START_TIMER_DEFAULT = 10000;

export class EditTugOfWar extends BaseEdit {
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
      };
    }

    this.card.game = IntegratedGame.TUG_OF_WAR;
  }

  public validate(): boolean {
    const sumOfTimers = this.card.timers.gameStart + this.card.timers.splashScreen;

    if (sumOfTimers > this._card.stopTimer) {
      Swal.fire(`The Countdown timers must be shorter than the card timer`, '', 'warning');
      return false;
    }

    return true;
  }

  public view({ attrs }: Vnode<IBaseEditAttrs>) {
    return template.call(this, attrs);
  }

  public get card(): ITugOfWarCard {
    return this._card as ITugOfWarCard;
  }

  public set splashScreenSeconds(value: number) {
    if (value > 59) {
      return;
    }

    this.card.timers.splashScreen = this.splashScreenMinutes * 60000 + value * 1000;
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
}
