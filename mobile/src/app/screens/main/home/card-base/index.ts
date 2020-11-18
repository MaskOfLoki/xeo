import { redraw, route, VnodeDOM } from 'mithril';
import { ClassBaseComponent } from '../../../../components/class-base';
import { ICard, CardTransition, IState, ChannelType, CardType } from '../../../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import styles from './module.scss';
import { getColor, delay } from '../../../../../../../common/utils';
import { api } from '../../../../services/api';
import { liveCard } from '../../../../services/live-card';

const routes = {
  [CardType.REACTION_THUMBS]: 'thumbs',
  [CardType.REACTION_APPLAUSE]: 'applause',
  [CardType.REACTION_SLIDER]: 'slider',
  [CardType.POLL]: 'poll',
  [CardType.TRIVIA]: 'trivia',
  [CardType.IMAGE]: 'image',
  [CardType.VIDEO]: 'video',
  [CardType.POLL_IMAGE]: 'poll-image',
  [CardType.TRIVIA_IMAGE]: 'trivia-image',
  [CardType.SOUNDER]: 'soundoff',
  [CardType.PGP]: 'pgp',
  [CardType.QB_TOSS]: 'qb_toss',
  [CardType.HAT_SHUFFLE]: 'hat-shuffle',
  [CardType.SKEEBALL]: 'skeeball',
  [CardType.POP_A_SHOT]: 'pop-a-shot',
  [CardType.TUG_OF_WAR]: 'tug-of-war',
  [CardType.FAN_FILTER_CAM]: 'fan-filter-cam',
  [CardType.TURBO_TRIVIA_2]: 'turbo-trivia-2',
};

export abstract class CardBaseScreen extends ClassBaseComponent {
  protected _card: ICard;
  protected _destroyed: boolean;
  protected _cardRoute: string;
  private _timelineCard: ICard;
  private _baseState: IState;

  constructor() {
    super();

    this._subscriptions.push(liveCard.subscribe(this.cardHandler.bind(this)));
  }

  protected stateHandler(value: IState) {
    super.stateHandler(value);

    this._baseState = value;

    this._cardRoute = route.get();
    //console.log("Base Route: "+this._cardRoute);
    //console.log("Card length: "+this._baseState.channel?.cards?.length);

    if (this._baseState?.channel?.cards) {
      this._baseState.channel?.cards.map((card) => {
        const tmpRoute = `/home/card/${routes[card.type]}`;
        //console.log(tmpRoute);
        if (tmpRoute === this._cardRoute) {
          this._timelineCard = card;
          //console.log("timelineCard: "+routes[this._timelineCard.type]);
          return;
        }
      });
    }
  }

  public oncreate(vnode: VnodeDOM) {
    super.oncreate(vnode);
    this.updateConfig();

    if (!this._card) {
      return;
    }

    switch (this._card.transition) {
      case CardTransition.FADE: {
        this._element.classList.add(styles.fadeIn);
        this._element.onanimationend = () => {
          this._element.classList.remove(styles.fadeIn);
          this._element.onanimationend = undefined;
        };
        break;
      }
      case CardTransition.SLIDE: {
        this._element.classList.add(styles.slideIn);
        this._element.onanimationend = () => {
          this._element.classList.remove(styles.slideIn);
          this._element.onanimationend = undefined;
        };
        break;
      }
    }

    api.writeAction(this._card.id, 'viewed');
  }

  protected cardHandler(value: ICard) {
    if (
      !value &&
      this._baseState?.channel?.type === ChannelType.TIMELINE &&
      !this._baseState?.channel?.synced &&
      this._cardRoute
    ) {
      if (this._timelineCard) {
        value = this._timelineCard;
      }
    }

    if (!value) {
      //console.log("live card is null");
      return;
    }
    //console.log("live card is "+ value.name);

    if (this._card && this._card.type !== value.type) {
      return;
    }

    if (!value.colors) {
      value.colors = {};
    }

    const oldCard = this._card;
    this._card = value;

    if (oldCard?.id !== this._card.id) {
      this.newCardHandler();
    }

    for (const key of Object.keys(this._card.colors)) {
      this._card.colors[key] = getColor(this._card.colors[key]);
    }

    this.updateConfig();
    redraw();
  }

  abstract newCardHandler();

  protected updateConfig() {
    if (!this._element || !this._card) {
      return;
    }

    if (!isEmptyString(this._card.images?.background)) {
      this._element.style.backgroundImage = `url(${this._card.images.background})`;
      this._element.style.backgroundPosition = 'center';
      this._element.style.backgroundRepeat = 'no-repeat';
      this._element.style.backgroundSize = 'cover';
    } else {
      this._element.style.backgroundImage = '';
    }

    if (this._card.colors?.background && !isEmptyString(getColor(this._card.colors.background))) {
      const color = getColor(this._card.colors.background);
      if (color.startsWith('#')) {
        this._element.style.backgroundColor = getColor(this._card.colors.background);
      } else if (!isEmptyString(this._card.images?.background)) {
        this._element.style.backgroundImage = `url(${this._card.images.background}), ${color}`;
      } else {
        this._element.style.backgroundImage = color;
      }
    } else {
      this._element.style.backgroundColor = '';
    }

    if (!isEmptyString(this._card.colors?.text)) {
      this._element.style.color = this._card.colors?.text;
    } else {
      this._element.style.color = '';
    }
  }

  public onbeforeremove() {
    const card = liveCard.get() ?? this._card;

    if (!this._element || !card) {
      return;
    }

    switch (card.transition) {
      case CardTransition.FADE: {
        this._element.classList.add(styles.fadeOut);
        return delay(500);
      }
      case CardTransition.SLIDE: {
        this._element.classList.add(styles.slideOut);
        return delay(500);
      }
    }
  }

  public onremove() {
    super.onremove();
    this._destroyed = true;
  }
}
