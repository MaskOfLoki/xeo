import { redraw, VnodeDOM } from 'mithril';
import { IApplauseParticipation, IApplauseCard, IConfig } from '../../../../../../../common/common';
import { randNumber } from '@gamechangerinteractive/xc-backend/utils';
import { api } from '../../../../services/api';
import { CardBaseScreen } from '../card-base';
import styles from './module.scss';
import { template } from './template';

export class CardApplauseScreen extends CardBaseScreen {
  private _userClaps: number;
  private _timerSubmit: number;
  private _timerRefreshTotalClaps: number;
  private _totalClaps = 0;
  private _dif = 0;
  private _points;

  constructor() {
    super();
    api.config.subscribe(this.configHandler.bind(this));
  }

  private configHandler(value: IConfig) {
    this._points = value.points?.applause;
    redraw();
  }

  public async newCardHandler() {
    this._userClaps = await api.getApplauseCardClaps(this._card);
    this._totalClaps = 0;
    this._dif = 0;
    clearTimeout(this._timerRefreshTotalClaps);
    clearTimeout(this._timerSubmit);
    this.refreshTotalClaps();
  }

  public clickHandler() {
    this._dif++;
    this._userClaps++;
    this._totalClaps++;
    this.generateRandomClap();

    if (!this._timerSubmit) {
      // do not submit claps too often to avoid backend overload
      this._timerSubmit = window.setTimeout(this.submitClaps.bind(this), 1000);
    }
  }

  public generateRandomClap() {
    const el = document.createElement('div');
    el.classList.add(styles.dynamicClap);

    if (this.card.images?.clap) {
      el.style.backgroundImage = `url(${this.card.images.clap})`;
    }

    let width = 0;

    width = randNumber(8, 20);

    el.innerHTML = '+' + this._points;
    el.style.fontSize = width / 3 + 'vw';
    el.style.width = width + 'vw';
    el.style.height = width + 'vw';
    el.style.top = randNumber(0, 75) + '%';
    el.style.left = randNumber(1, 100 - width - 5) + '%';

    el.onanimationend = () => {
      el.remove();
      el.onanimationend = undefined;
    };

    this._element.appendChild(el);
  }

  private async submitClaps() {
    this._timerSubmit = null;
    const dif = this._dif;
    this._dif = 0;
    this._totalClaps = await api.submitApplauseCardClap(this._card, dif);
    api.writeAction(this._card.id, 'claps', dif);
    redraw();
  }

  private async refreshTotalClaps() {
    if (this._destroyed) {
      return;
    }

    const participation: IApplauseParticipation = (await api.getParticipation(
      this._card,
      true,
    )) as IApplauseParticipation;
    this._totalClaps = participation.claps;
    redraw();
    this.scheduleRefreshTotalClaps();
  }

  private scheduleRefreshTotalClaps() {
    if (this._destroyed) {
      return;
    }

    this._timerRefreshTotalClaps = window.setTimeout(this.refreshTotalClaps.bind(this), 1000);
  }

  public view() {
    return template.call(this);
  }

  public onremove() {
    super.onremove();
    clearTimeout(this._timerRefreshTotalClaps);
  }

  public get userClaps(): number {
    return this._userClaps;
  }

  public get totalClaps(): number {
    return this._totalClaps;
  }

  public get card(): IApplauseCard {
    return this._card as IApplauseCard;
  }
}
