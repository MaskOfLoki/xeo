import { redraw, VnodeDOM } from 'mithril';
import noUiSlider from 'nouislider';

import { gcLocalStorage } from '@gamechangerinteractive/xc-backend';
import { ISliderCard, ISliderParticipation } from '../../../../../../../common/common';
import {
  SLIDER_DIVISIONS,
  SLIDER_MAX_VALUE,
  SLIDER_VALUE_COUNT,
  SLIDER_LABEL_LENGTH,
} from '../../../../../../../common/constants/cards';
import { api } from '../../../../services/api';
import { PARTICIPATION_REFRESH_TIME } from '../../../../utils';
import { ExecutionQueue } from '../../../../utils/ExecutionQueue';
import { CardBaseScreen } from '../card-base';

import 'nouislider/distribute/nouislider.css';
import styles from './module.scss';
import { template } from './template';
import { isPreview } from '../../../../../../../common/utils/query';

export class CardSliderScreen extends CardBaseScreen {
  private _slider;
  private _initialValue: number;
  private _value = 0;
  private _timerSubmit: number;
  private _timerParticipation: number;
  private _percentage: number[] = [];
  private _dbQueue: ExecutionQueue<void> = new ExecutionQueue();

  public oncreate(vnode: VnodeDOM) {
    super.oncreate(vnode);
    const slider = this._element.querySelector(`.${styles.slider}`);

    this._slider = noUiSlider.create(slider, {
      start: [SLIDER_MAX_VALUE - this._value],
      range: {
        min: [0],
        max: [SLIDER_MAX_VALUE],
      },
    });

    this._slider.on('slide', this.slideHandler.bind(this));
    this.refreshParticipation();
    this.changeBackgroundHandleTitle();
    this.getInitialValue();
    redraw();
  }

  public view() {
    return template.call(this);
  }

  private async getInitialValue() {
    this._initialValue = await api.getSliderCardValue(this._card);

    if (this._initialValue == null) {
      // if user haven't submitted the choice yet, we submit initial value
      this._timerSubmit = window.setTimeout(this.submitValue.bind(this), 1000);
    } else {
      this._value = this._initialValue;
      this.changeBackgroundHandleTitle();
      this._slider.set(await gcLocalStorage.getItem('slider.value'));
    }

    redraw();
  }

  public newCardHandler() {
    // TODO
  }

  private slideHandler(e: string[]) {
    this._value = SLIDER_MAX_VALUE - Math.floor(this._slider.get());
    clearTimeout(this._timerSubmit);
    this.changeBackgroundHandleTitle();
    // throttle slide events
    this._timerSubmit = window.setTimeout(this.submitValue.bind(this), 1000);
    redraw();
  }

  private submitValue() {
    clearTimeout(this._timerSubmit);

    if (isPreview()) {
      return;
    }

    this._dbQueue.push(this.doSubmitValue.bind(this));

    if (this._dbQueue.length === 1) {
      this._dbQueue.run();
    }
  }

  private async doSubmitValue() {
    await api.submitSliderCardValue(this._card, this._value, this._initialValue);
    api.writeAction(this._card.id, 'slide_value', this._value);
    this.refreshParticipation(true);
    this._initialValue = this._value;
    gcLocalStorage.setItem('slider.value', this._slider.get());
  }

  private changeBackgroundHandleTitle() {
    const handleUI: HTMLDivElement = this._element.querySelector('.noUi-handle');
    handleUI.style.setProperty('--noui-text', `'${this.topLabel}'`);
    handleUI.style.outline = 'none';
    handleUI.style.userSelect = 'none';
  }

  private async refreshParticipation(ignoreCache?: boolean) {
    clearTimeout(this._timerParticipation);

    if (this._destroyed) {
      return;
    }

    const result: ISliderParticipation = (await api.getParticipation(this._card, ignoreCache)) as ISliderParticipation;

    this._percentage = Array.from({ length: SLIDER_DIVISIONS }).map(() => 0);
    for (let i = 0; i < SLIDER_VALUE_COUNT; ++i) {
      const idx = Math.floor(i / SLIDER_DIVISIONS);
      this._percentage[idx] += result[i];
    }

    this._percentage = this._percentage.map((_, index) =>
      result.total ? Math.round((100 * this._percentage[index]) / result.total) : 0,
    );

    redraw();

    this._timerParticipation = window.setTimeout(
      this.refreshParticipation.bind(this, true),
      PARTICIPATION_REFRESH_TIME,
    );
  }

  public onremove() {
    super.onremove();
    clearTimeout(this._timerParticipation);
    clearTimeout(this._timerSubmit);
  }

  public label(index: number): string {
    return this.card.labels[SLIDER_DIVISIONS - index - 1].slice(0, SLIDER_LABEL_LENGTH);
  }

  public percentage(index: number): number {
    return this._percentage[SLIDER_DIVISIONS - index - 1] ? this._percentage[SLIDER_DIVISIONS - index - 1] : 0;
  }

  public get percentageList(): number[] {
    return this._percentage;
  }

  public get topLabel(): string {
    return this.label(SLIDER_DIVISIONS - this.value - 1).slice(0, SLIDER_LABEL_LENGTH);
  }

  public get card(): ISliderCard {
    return this._card as ISliderCard;
  }

  public get value(): number {
    return Math.floor(this._value / SLIDER_DIVISIONS);
  }

  public get imageIndex(): number {
    if (!this._slider) {
      return 0;
    }

    return Math.floor(this._slider.get());
  }
}
