import { Vnode, redraw } from 'mithril';
import { template } from './template';
import {
  ICard,
  CardStatus,
  IMainboardState,
  CardStopMode,
  CardType,
  ITargetCard,
  TargetType,
  ITurboTriviaCard,
  TurboTriviaPlayMode,
  ChannelType,
} from '../../../../../common/common';
import { ICardTypeData, CardTypeDataFactory } from '../../utils/CardTypeDataFactory';
import { api } from '../../services/api';
import Swal from 'sweetalert2';
import { MobilePreview } from '../mobile-preview';
import { ChannelStateComponent, IChannelStateAttrs } from '../../utils/ChannelStateComponent';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { IValidateResult } from '../../services/api/turbo-trivia/APITurboTriviaService';

export interface ICardAttrs extends IChannelStateAttrs {
  card: ICard;
  preview: boolean;
  disabled: boolean;
  onedit: VoidFunction;
  ondelete: VoidFunction;
  onduplicate: VoidFunction;
  switchcardsets: VoidFunction;
}

export class Card extends ChannelStateComponent<IChannelStateAttrs> {
  private _card: ICard;
  private _typeData: ICardTypeData;
  private _mainboardState: IMainboardState;
  private _status: string;
  private _timerId: number;

  protected _suffix = 'mainboard';

  public preview: MobilePreview;

  protected stateHandler(value: IMainboardState) {
    super.stateHandler(value);
    this._mainboardState = value;
  }

  public onbeforeupdate(vnode: Vnode<ICardAttrs>) {
    super.onbeforeupdate(vnode);
    const attrs = vnode.attrs;

    if (this._card === attrs.card) {
      return;
    }

    this._card = attrs.card;
    this._typeData = CardTypeDataFactory.get(this._card.type);

    if (this._card.status === CardStatus.INACTIVE) {
      this._status = '';
      clearTimeout(this._timerId);
      this._timerId = undefined;
      return;
    }

    if (this._card.stopMode === CardStopMode.AUTO) {
      if (!this._timerId) {
        this._timerId = window.setTimeout(this.tickHandler.bind(this));
      }
      return;
    }

    clearTimeout(this._timerId);
    this._timerId = undefined;

    if (this._card.stopMode === CardStopMode.MANUAL) {
      this._status = 'MANUAL';
      return;
    }

    if (this._card.stopMode === CardStopMode.CENSUS) {
      this._status = this._card.stopCensus.toString();
    }
  }

  public async buttonStatusHandler(event: MouseEvent) {
    // '1' is the code for the LEFT CLICK of the mouse
    // If we have a mouse event, we only want to act on a left click
    if (event && event.which !== 1) {
      return;
    }

    switch (this._card.status) {
      case CardStatus.LIVE: {
        api.stopCard(this._card.id, this._channelId);
        this._card.status = CardStatus.DONE;
        return;
      }

      case CardStatus.DONE: {
        const result = await Swal.fire({
          title: 'RESET CARD',
          html: 'This will wipe any participation data associated with the card. <p/> Are you sure you want to reset? ',
          showCancelButton: true,
          confirmButtonText: 'RESET',
        });

        if (result.dismiss) {
          return;
        }

        api.resetCard(this._card.id, this._channelId);

        // Turbo Trivia Reset
        if (this._card.type === CardType.TURBO_TRIVIA_2) {
          api.turbotrivia.resetActive();
        }

        this._card.status = CardStatus.INACTIVE;
        return;
      }
      default: {
        if (this._card.type === CardType.TARGET) {
          const card: ITargetCard = this._card as ITargetCard;

          if (card.targetType === TargetType.CARD) {
            const targetCard: ICard = this.channel.cards.find((c) => c.id === (card.target as ICard)?.id);

            if (!targetCard) {
              Swal.fire({
                icon: 'warning',
                title: 'Cannot find targeting card probably it was deleted',
              });
              return;
            }

            if (targetCard.status === CardStatus.INACTIVE) {
              Swal.fire({
                icon: 'warning',
                title: 'Please run targeting card first',
              });
              return;
            }
          }
        }

        if (this._card.type === CardType.TURBO_TRIVIA_2 && this.channel.type === ChannelType.MANUAL) {
          const card = this._card as ITurboTriviaCard;

          const isAutoRun = card.mode == TurboTriviaPlayMode.AUTO_DRIVE;
          const isFreePlay = card.mode == TurboTriviaPlayMode.FREE_PLAY;

          const error: IValidateResult = await api.turbotrivia.validateGame(
            card.slot,
            isFreePlay,
            isAutoRun,
            Math.floor(card.timers.revealTimer / 1000),
            Math.floor(card.timers.intermissionTimer / 1000),
            card.id,
          );

          if (!isEmptyString(error.result)) {
            Swal.fire({
              title: error.result,
              icon: 'warning',
            });
            return;
          }

          api.turbotrivia.publishGame(
            error.slot.data,
            isFreePlay,
            isAutoRun,
            Math.floor(card.timers.revealTimer / 1000),
            Math.floor(card.timers.intermissionTimer / 1000),
          );
          api.playCard(this._card.id, this._channelId);
        } else {
          api.playCard(this._card.id, this._channelId);
        }
      }
    }
  }

  private tickHandler() {
    if (this._card.stopMode !== CardStopMode.AUTO || this._card.status !== CardStatus.LIVE) {
      return;
    }

    if (this._mainboardState) {
      const now = api.time();
      const rawTimer = this._card.startTime + this._card.stopTimer + this._mainboardState.startTime - now;
      const timer = Math.floor(rawTimer * 0.001);

      const minutes: number = Math.floor(timer / 60);
      const seconds: number = timer - minutes * 60;
      this._status = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (rawTimer <= 0) {
        api.stopCard(this._card.id, this._channelId);
        this._timerId = undefined;
        return;
      }
    }

    this._timerId = window.setTimeout(this.tickHandler.bind(this), 1000);
    redraw();
  }

  public sendToMainboardHandler() {
    api.updateMainboardCustomCard(this._card, this._channelId);
  }

  public removeFromMainboardHandler() {
    api.updateMainboardCustomCard(null, this._channelId);
  }

  public view({ attrs }: Vnode<ICardAttrs>) {
    return template.call(this, attrs);
  }

  public get card(): ICard {
    return this._card;
  }

  public get typeData(): ICardTypeData {
    return this._typeData;
  }

  public get isMainboard(): boolean {
    return this._mainboardState?.customCard?.id === this._card?.id;
  }

  public get status(): string {
    return this._status;
  }
}
