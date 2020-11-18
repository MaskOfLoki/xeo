import { VnodeDOM } from 'mithril';

import {
  IAction,
  ICard,
  CardType,
  IThumbsCard,
  IApplauseCard,
  ITextPollCard,
  PollType,
  ITriviaCard,
} from '../../../../../../common/common';
import { api } from '../../../services/api';
import { template } from './template';
import { ClassBaseComponent } from '../../../components/class-base';

import styles from './module.scss';
import { liveCard } from '../../../services/live-card';
import { orientation } from '../../../services/OrientationService';

export class FeedBar extends ClassBaseComponent {
  private _actions: IAction[] = [];
  private _card: ICard;
  private _retrieveInterval: number;
  private _renderInterval: number;
  private _actionsContainer: HTMLElement;

  public oncreate(vnode: VnodeDOM) {
    super.oncreate(vnode);

    this._subscriptions.push(liveCard.subscribe(this.liveCardHandler.bind(this)));
    this._subscriptions.push(orientation.subscribe(this.orientationChangeHandler.bind(this)));
    this._retrieveInterval = window.setInterval(this.retrieveActions.bind(this), 8000);
    this._renderInterval = window.setInterval(this.renderActions.bind(this), 2000);
    this._actionsContainer = this._element.querySelector('#actions');
    this.retrieveActions();
  }

  public view(vnode) {
    return template.call(this, vnode.attrs);
  }

  public onremove(): void {
    super.onremove();
    clearInterval(this._retrieveInterval);
    clearInterval(this._renderInterval);
  }

  private orientationChangeHandler() {
    if (this._actionsContainer) {
      while (this._actionsContainer.lastElementChild) {
        this._actionsContainer.removeChild(this._actionsContainer.lastChild);
      }
    }
  }

  private liveCardHandler(card: ICard) {
    this._card = card;
  }

  private async retrieveActions(): Promise<void> {
    const id = this._card?.id;
    let key = 'checkins';

    if (typeof id === 'number') {
      key = id.toString();
    }

    const ctype = this._card?.type;

    const actions = await api.getRandomActions(key, 5);

    actions.forEach((action) => (action.cardType = ctype));
    this._actions = this._actions.concat(actions);
  }

  private renderActions(): void {
    if (!this._actions.length || document.hidden || !this._card) {
      return;
    }

    const action = this._actions.splice(0, 1)[0];

    // Container element
    const el = document.createElement('div');
    el.classList.add(styles.action);

    // Add the action icon
    el.appendChild(this.createActionIcon(action));

    // Text container
    const text = document.createElement('div');
    text.classList.add(styles.text);
    text.innerHTML = action.username;
    el.appendChild(text);

    // Remove the container once it has scrolled through the view
    el.onanimationend = () => {
      el.remove();
      el.onanimationend = undefined;
    };

    // Add container to page
    this._actionsContainer.appendChild(el);
  }

  private createActionIcon(action: IAction) {
    //
    const icon = document.createElement('div');
    icon.classList.add(styles.icon);

    // Do card-specific styles
    switch (action.cardType) {
      case CardType.REACTION_SLIDER: {
        const imageIndex = Math.floor(parseInt(action.value));
        icon.style.backgroundImage = `url(assets/images/cards/slider/${imageIndex}.png)`;
        break;
      }
      case CardType.REACTION_APPLAUSE: {
        const card = this._card as IApplauseCard;
        icon.style.backgroundImage = `url(${card.images.clap ?? 'assets/images/cards/applause/clap.svg'})`;
        break;
      }
      case CardType.REACTION_THUMBS: {
        const card = this._card as IThumbsCard;
        const image = action.value === 'up' ? card.images.up : card.images.down;
        icon.style.backgroundImage = `url(${image})`;
        icon.style.borderRadius = '50%';
        break;
      }
      case CardType.POLL: {
        const card: ITextPollCard = this._card as ITextPollCard;

        if (card.pollType === PollType.MULTIPLE_CHOICE) {
          const index = card.answers.indexOf(action.value) + 1;

          if (index > 0) {
            applyIconTextStyle(icon);
            icon.innerHTML = 'ABCDE'[index - 1];
          }
        }

        break;
      }
      case CardType.TRIVIA: {
        const card: ITriviaCard = this._card as ITriviaCard;

        if (!card.answers) {
          break;
        }

        const index = card.answers.findIndex((item) => item.value === action.value) + 1;

        if (index > 0) {
          applyIconTextStyle(icon);
          icon.innerText = 'ABCDE'[index - 1];
        }
        break;
      }
      case CardType.POLL_IMAGE:
      case CardType.TRIVIA_IMAGE: {
        const index = parseInt(action.value) + 1;

        if (!isNaN(index) && index > 0) {
          applyIconTextStyle(icon);
          icon.innerText = 'ABCDE'[index - 1];
        }
        break;
      }
      default:
        break;
    }

    return icon;
  }
}

function applyIconTextStyle(icon: HTMLElement) {
  icon.style.borderRadius = '10vmin';
  icon.style.backgroundColor = 'white';
  icon.style.color = 'black';
  icon.style.width = '5vmin';
  icon.style.height = '5vmin';
  icon.style.fontSize = '4vmin';
  icon.style.textAlign = 'center';
}
