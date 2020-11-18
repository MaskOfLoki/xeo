import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';
import { ICard } from '../../../../../../../common/common';

export interface IStopSettingsAttrs {
  card: ICard;
  disableCensus: boolean;
  disabled?: boolean;
}

export class StopSettings implements ClassComponent<IStopSettingsAttrs> {
  private _card: ICard;

  public currentMinutes: string;
  public currentSeconds: string;

  public oninit(vnode: Vnode<IStopSettingsAttrs>) {
    this._card = vnode.attrs.card;

    if (!this._card.stopTimer) {
      this._card.stopTimer = 300000;
    }

    if (!this._card.stopCensus) {
      this._card.stopCensus = 1000000;
    }

    this.currentMinutes = this.minutes.toString().padStart(2, '0');
    this.currentSeconds = this.seconds.toString().padStart(2, '0');
  }

  public view(vnode: Vnode<IStopSettingsAttrs>) {
    return template.call(this, vnode.attrs);
  }

  public get card(): ICard {
    return this._card;
  }

  public set seconds(value: number) {
    if (value > 59) {
      return;
    }

    this._card.stopTimer = this.minutes * 60000 + value * 1000;
  }

  public get seconds(): number {
    return Math.floor((this._card.stopTimer - this.minutes * 60000) * 0.001);
  }

  public set minutes(value: number) {
    if (value > 99) {
      return;
    }

    this._card.stopTimer = value * 60000 + this.seconds * 1000;
  }

  public get minutes(): number {
    return Math.floor(this._card.stopTimer / 60000);
  }
}
