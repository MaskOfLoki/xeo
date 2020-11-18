import { redraw } from 'mithril';
import { template } from './template';
import { Props } from 'tippy.js';
import { Unsubscribable } from 'rxjs';
import { ICard, IParticipation, CardStopMode } from '../../../../../../../../common/common';
import { liveCard } from '../../../../../../../../common/utils/live-card';
import { ParticipationDataFactory } from './ParticipationDataFactory';
import { api } from '../../../../../services/api';
import { ChannelStateComponent, IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';

export class Participation extends ChannelStateComponent<IChannelStateAttrs> {
  private _data: IParticipationData;

  private _subscription: Unsubscribable;
  private _card: ICard;
  private _participation: IParticipation;
  private _timerId: number;

  protected channelChanged() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }

    clearTimeout(this._timerId);
    this._timerId = undefined;
    this._subscription = liveCard.subscribe(this.liveCardHandler.bind(this), this._channelId);
  }

  private liveCardHandler(value: ICard) {
    if (this._card?.id === value?.id) {
      return;
    }

    this._card = value;
    this._data = undefined;
    clearTimeout(this._timerId);
    this._timerId = undefined;

    if (!this._card) {
      return;
    }

    this._timerId = setTimeout(this.tickHandler.bind(this));
  }

  private async tickHandler() {
    if (!this._timerId) {
      return;
    }

    this._participation = await api.getParticipation(this._card, this._channelId);

    if (!this._timerId) {
      return;
    }

    if (this._card.stopMode === CardStopMode.CENSUS && this._card.stopCensus <= this._participation.total) {
      api.stopCard(this._card.id, this._channelId);
      return;
    }

    this._data = ParticipationDataFactory.get(this._card, this._participation);

    if (
      this._data?.bars?.length > 0 &&
      this._data.bars.some((b1) => this._data.bars.some((b2) => b1.percentage !== b2.percentage))
    ) {
      this._data.bars.concat().sort((p1, p2) => p2.percentage - p1.percentage)[0].top = true;
    }

    this._timerId = window.setTimeout(this.tickHandler.bind(this), 1000);
    redraw();
  }

  public onremove() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }

    clearTimeout(this._timerId);
    this._timerId = undefined;
  }

  public view() {
    return template(this._data, this._card, this._participation);
  }
}

export interface IParticipationData {
  title: string;
  subtitle?: string;
  total: number;
  bars?: IParticipationBar[];
  component?;
}

export interface IParticipationBar {
  tooltip?: Partial<Props>;
  label: string;
  percentage?: number;
  amount: number;
  top?: boolean;
}
