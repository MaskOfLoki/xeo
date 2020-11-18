import { route, Vnode } from 'mithril';
import { template } from './template';
import { CardType, ChannelType, ICard, IState } from '../../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { config } from '../../../services/ConfigService';
import { ClassBaseComponent } from '../../../components/class-base';
import { liveCard } from '../../../services/live-card';
import { orientation } from '../../../services/OrientationService';
import { Unsubscribable } from 'rxjs';
import { api } from '../../../services/api';

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
  [CardType.BROWSER]: 'web',
  [CardType.TURBO_TRIVIA_2]: 'turbo-trivia-2',
};

export class HomeScreen extends ClassBaseComponent {
  private _online: boolean;
  // Had to separate the live card subscription due to this._subscriptions not keeping order randomly
  private _liveCardSubscription: Unsubscribable;
  private _previousCard: ICard;
  private _state: IState;

  public oninit(): void {
    api.verifyLeaderboardData();
  }

  protected stateHandler(value: IState) {
    super.stateHandler(value);

    this._state = value;

    this._online = !isEmptyString(value?.sid);

    if (!this._online) {
      route.set('/home');

      if (this._liveCardSubscription) {
        this._liveCardSubscription.unsubscribe();
        this._liveCardSubscription = undefined;
      }

      return;
    }

    if (this._liveCardSubscription) {
      return;
    }

    this._liveCardSubscription = liveCard.subscribe(this.liveCardHandler.bind(this));
  }

  private liveCardHandler(card: ICard) {
    // TODO: too much same routes, need to refactor the code to make it cleaner
    //console.log('Redireting to proper card');

    if (!card) {
      if (this._online) {
        if (orientation.isPortrait && config.home.wait?.portrait) {
          route.set('/home/wait');
        } else if (!orientation.isPortrait && config.home.wait?.landscape) {
          route.set('/home/wait');
        } else {
          //console.log("livehandler home1");
          //route.set('/home');
          if (!this._state.channel.synced && this._state.channel.type === ChannelType.TIMELINE) {
            if (this._previousCard) {
              const endRoute = '/unsynced-end/' + routes[this._previousCard.type];
              route.set(endRoute);
              return;
            }
          } else {
            route.set('/home');
          }
        }
      } else {
        //console.log('livehandler home2');
        route.set('/home');
      }

      return;
    }

    const isSameCard = this._previousCard ? this._previousCard.id === card.id : false;
    this._previousCard = card;
    const cardRoute = routes[card.type];

    if (!cardRoute) {
      console.error('Unknown route for card', card);
      return;
    }

    const currentRoute = route.get();

    // TODO: too much same routes, need to refactor the code below to make it cleaner
    if (!isSameCard && currentRoute === `/home/card/${cardRoute}`) {
      if (orientation.isPortrait && config.home.wait?.portrait) {
        route.set('/home/wait');
      } else if (!orientation.isPortrait && config.home.wait?.landscape) {
        route.set('/home/wait');
      } else {
        //console.log('livehandler home3');
        route.set('/home');
      }
      setTimeout(() => route.set(`/home/card/${cardRoute}`), 100);
    } else {
      route.set(`/home/card/${cardRoute}`);
    }
  }

  public onremove() {
    super.onremove();
    if (this._liveCardSubscription) {
      this._liveCardSubscription.unsubscribe();
      this._liveCardSubscription = undefined;
    }
  }

  public view(vnode: Vnode) {
    return template.call(this, vnode);
  }
}
