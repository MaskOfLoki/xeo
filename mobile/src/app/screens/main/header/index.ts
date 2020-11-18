import { redraw, route, VnodeDOM } from 'mithril';
import { template } from './template';
import { api } from '../../../services/api';
import { IState, IUser, ICard, IConfig, ITermCondition } from '../../../../../../common/common';
import { IGCLeader } from '@gamechangerinteractive/xc-backend/types/IGCLeader';
import gsap from 'gsap';
import { filter } from 'rxjs/operators';
import { ClassBaseComponent } from '../../../components/class-base';
import styles from './module.scss';
import { liveCard } from '../../../services/live-card';
import { deviceService } from '../../../services/DeviceService';

export class Header extends ClassBaseComponent {
  private _username: string;
  private _points: number;
  private _rank: number;
  private _eventName: string;
  private _slidenav: Element;
  private _termsSlidenav: Element;
  private _headerOverlay: Element;

  public isEvent = false;
  public terms: ITermCondition[] = [];
  public enableChatroom: boolean;

  constructor() {
    super();
    this._subscriptions.push(
      api.user.subscribe(this.userHandler.bind(this)),
      liveCard.subscribe(this.liveCardHandler.bind(this)),
      api.points.pipe(filter((value) => !!value)).subscribe(this.pointsHandler.bind(this)),
      api.config.pipe(filter((value) => !!value)).subscribe(this.configHandler.bind(this)),
    );
  }

  public view() {
    return template.call(this);
  }

  public oncreate(vnode: VnodeDOM) {
    super.oncreate(vnode);
    // TODO: move side navigation and terms into dedicated components
    this._slidenav = this._element.querySelector('#main_nav');
    this._termsSlidenav = this._element.querySelector('#terms_nav');
    this._headerOverlay = this._element.querySelector('#header_overlay');
  }

  public onSlideNav(event: Event) {
    event.stopPropagation();
    this._slidenav.classList.toggle(styles.open);
    this._headerOverlay.classList.toggle(styles.show);

    if (this._termsSlidenav && this._termsSlidenav.classList.contains(styles.open)) {
      this._termsSlidenav.classList.toggle(styles.open);
    }
  }

  public onTerms(event: Event) {
    event.stopPropagation();

    if (this._termsSlidenav) {
      this._termsSlidenav.classList.toggle(styles.open);
    }
  }

  private userHandler(value: IUser) {
    this._username = value.username;
    redraw();
  }

  private configHandler(config: IConfig): void {
    this.enableChatroom = config.misc?.enableChatroom;
    this.terms = config.terms || [];

    redraw();
  }

  public goToHome() {
    route.set('home');
  }

  public onRouterClick(routePath) {
    route.set(routePath);
    this._headerOverlay.classList.toggle(styles.show);
    this._slidenav.classList.toggle(styles.open);
  }

  protected stateHandler(value: IState) {
    super.stateHandler(value);
    this._eventName = value?.channel?.name;
    redraw();
  }

  private liveCardHandler(card: ICard) {
    this.isEvent = !!card;
  }

  private pointsHandler(value: IGCLeader) {
    if (this._points == null) {
      this._points = value.points;
      this._rank = value.position + 1;
      return;
    }

    const pointsData = { value: this._points };

    gsap.to(pointsData, {
      value: value.points,
      duration: 1,
      onUpdate: () => {
        this._points = Math.round(pointsData.value);
        redraw();
      },
    });

    const rankData = { value: this._rank };

    gsap.to(rankData, {
      value: value.position + 1,
      duration: 1,
      onUpdate: () => {
        this._rank = Math.round(rankData.value);
        redraw();
      },
    });
  }

  public get username(): string {
    return this._username;
  }

  public get points(): number {
    return this._points;
  }

  public get rank(): number {
    return this._rank;
  }

  public get eventName() {
    return this._eventName;
  }

  public get showInfo() {
    if (
      route.get().includes('frontgate') ||
      route.get().includes('avatar-select') ||
      route.get().includes('userinfo') ||
      deviceService.isDesktop
    ) {
      return false;
    } else {
      return true;
    }
  }

  public get showChatroomItem(): boolean {
    return deviceService.isMobile || !this.eventRunning || (!this.showChatroom && this.showMediaContent);
  }

  public get showRankItem(): boolean {
    return deviceService.isMobile || this.showChatroom || (this.hasChannelVideo && this.showMediaContent);
  }
}
