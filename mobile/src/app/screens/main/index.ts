import { Vnode, redraw } from 'mithril';
import { template as mobileTemplate } from './template';
import { template as desktopTemplate } from './template.desktop';
import { Unsubscribable } from 'rxjs';
import { api } from '../../services/api';
import { CardType, ICard, IState, IUser } from '../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { isRTMPStream } from '../../../../../common/utils';
import { BaseScreen } from '../base';
import { IGCLeader } from '@gamechangerinteractive/xc-backend';
import { liveCard } from '../../services/live-card';
import { config } from '../../services/ConfigService';

export class MainScreen extends BaseScreen {
  private _showMarketingMessages: boolean;
  private _user: IUser;
  private _sid: string;
  private _leaderboardEntry: IGCLeader;
  private readonly _subscriptions: Unsubscribable[];
  private _timeout;

  public hasChannelVideo = false;
  public showChatroom = false;
  public showMediaContent = false;
  public points = 0;
  public showNotificationButton = false;
  public showCard = false;
  public notificationIcon: string;

  constructor() {
    super();
    this._subscriptions = [
      api.state.subscribe(this.stateHandler.bind(this)),
      api.user.subscribe(this.userHandler.bind(this)),
      liveCard.subscribe(this.liveCardHandler.bind(this)),
    ];
  }

  public onremove() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = null;
  }

  public notificationHandler(): void {
    this.showCard = true;
    this.showNotificationButton = false;
    redraw();
  }

  public closeHandler(): void {
    this.showCard = false;
    redraw();
  }

  public get showMarketingMessages(): boolean {
    return this._showMarketingMessages;
  }

  private stateHandler(state: IState): void {
    this._showMarketingMessages = state?.showMarketingMessages === undefined || state.showMarketingMessages;
    this.hasChannelVideo = !(
      isEmptyString(state?.sid) ||
      (!isRTMPStream(state?.channel?.media) && isEmptyString(state?.channel?.media as string))
    );
    this.showMediaContent = state?.channel?.showMedia;
    this.showChatroom = state?.channel?.showChatroom;
    this._sid = state?.sid;
    this.doPoll(); // Do a rank update every state change
    redraw();
  }

  private userHandler(user: IUser): void {
    this._user = user;
    redraw();
  }

  private doPoll() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }

    this.pollRank();
  }

  private async pollRank() {
    this._timeout = null;
    this._leaderboardEntry = await api.getLeaderEntry(this._sid ?? 'overall');
    this._timeout = setTimeout(this.pollRank.bind(this), 600000); // Only update every 60 seconds
    redraw();
  }

  private liveCardHandler(card: ICard): void {
    this.showNotificationButton = !!card;
    if (this.showNotificationButton) {
      switch (card.type) {
        case CardType.REACTION_THUMBS:
          this.notificationIcon = 'thumb-up.svg';
          break;
        case CardType.REACTION_APPLAUSE:
          this.notificationIcon = 'applause.svg';
          break;
        case CardType.REACTION_SLIDER:
          this.notificationIcon = 'smiley.svg';
          break;
        case CardType.POLL:
        case CardType.POLL_IMAGE:
          this.notificationIcon = 'poll.svg';
          break;
        case CardType.TRIVIA:
        case CardType.TRIVIA_IMAGE:
          this.notificationIcon = 'trivia.svg';
          break;
        case CardType.IMAGE:
          this.notificationIcon = 'image.svg';
          break;
        case CardType.VIDEO:
          this.notificationIcon = 'video.svg';
          break;
        case CardType.SOUNDER:
          this.notificationIcon = 'sounder.svg';
          break;
        case CardType.QB_TOSS:
        case CardType.HAT_SHUFFLE:
        case CardType.POP_A_SHOT:
        case CardType.SKEEBALL:
        case CardType.TURBO_TRIVIA_2:
        case CardType.TUG_OF_WAR:
        case CardType.FAN_FILTER_CAM:
          this.notificationIcon = 'arcade_game_icon.svg';
          break;
        case CardType.TARGET:
          this.notificationIcon = 'target.svg';
          break;
        case CardType.BROWSER:
          this.notificationIcon = 'web.svg';
          break;
        default:
          this.notificationIcon = '';
      }

      this.notificationIcon = `assets/images/icons/cards/${this.notificationIcon}`;
    }
    redraw();
  }

  protected get mobileTemplate(): (_: Vnode<{}, {}>) => any {
    return mobileTemplate;
  }
  protected get desktopTemplate(): (_: Vnode<{}, {}>) => any {
    return desktopTemplate;
  }

  public get username(): string {
    return this._user?.username ?? '';
  }

  public get rank(): number {
    return (this._leaderboardEntry?.position ?? 0) + 1;
  }

  public get rotatedStyles() {
    return window.innerWidth / window.innerHeight > 1
      ? {
          background: `linear-gradient(to bottom, ${config.home.colors.tertiary.foreground}, ${config.home.colors.tertiary.background})`,
        }
      : null;
  }
}
