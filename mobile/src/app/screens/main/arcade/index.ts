import { ClassBaseComponent } from '../../../components/class-base';
import { IGame, SUPPORTED_PREMIUM_ARCADE_GIDS, SUPPORTED_ARCADE_GIDS, IConfig } from '../../../../../../common/common';
import { api } from '../../../services/api';
import { redraw, route } from 'mithril';
import Swiper from 'swiper';
import 'swiper/css/swiper.min.css';
import { template } from './template';
import styles from './module.scss';

export class ArcadeScreen extends ClassBaseComponent {
  private _maxGroupSize = 9;
  private _gameConfigs: any = {};
  private _groups: IGame[][] = [];
  private _size: number;
  private _swiper: Swiper;
  private _swiperElement: HTMLElement;
  private _resizing = false;
  private _layout = 'list';

  public oninit() {
    api.getGames().then(this.buildGameGroups.bind(this));
    this._subscriptions.push(api.config.subscribe(this.configHandler.bind(this)));
    api.verifyLeaderboardData();
  }

  public onupdate() {
    this._swiperElement = this._element.querySelector(`.${styles.groupSwiper}`);

    if (!this._resizing) {
      this.resizeHandler();
    } else {
      this._resizing = false;
    }

    if (this._swiper) {
      this._swiper.detachEvents();
    }

    this._swiper = new Swiper(this._swiperElement, {
      direction: 'horizontal',
      loop: false,
      pagination: {
        el: this._element.querySelector('.swiper-pagination') as HTMLElement,
      },
    });
  }

  public view() {
    return template.call(this);
  }

  public onGameSelect(game: IGame) {
    route.set(`/arcade/${game.id}`);
  }

  public gameIcon(game: IGame): string {
    const defaultIcon = 'assets/images/icons/arcade_game_icon.svg';

    if (this._gameConfigs[game.id]) {
      return this._gameConfigs[game.id].images?.icon || defaultIcon;
    }

    return defaultIcon;
  }

  public gameName(game: IGame): string {
    if (this._gameConfigs[game.id]) {
      return this._gameConfigs[game.id].text?.gameTitle || game.name;
    }

    return game.name;
  }

  public get gamesGroups(): IGame[][] {
    return this._groups;
  }

  public get size(): number {
    return this._size;
  }

  public get layout(): string {
    return this._layout;
  }

  private configHandler(config: IConfig): void {
    this._gameConfigs = config?.arcade || {};
    this._layout = config?.arcade?.defaultLayout;
    redraw();
  }

  private resizeHandler() {
    this._resizing = true;
    const w = this._swiperElement.offsetWidth;
    const h = this._swiperElement.offsetHeight;

    const sizeW = Math.floor(w * 0.2);
    const sizeH = Math.floor(h * 0.2);
    this._size = Math.min(sizeW, sizeH);
    redraw();
  }

  private buildGameGroups(games: IGame[]): void {
    const premium = [];
    const regular = [];

    for (const game of games) {
      if (Object.values(SUPPORTED_PREMIUM_ARCADE_GIDS).includes(game.id) && this._gameConfigs[`enable-${game.id}`]) {
        premium.push(game);
      } else if (Object.values(SUPPORTED_ARCADE_GIDS).includes(game.id) && this._gameConfigs[`enable-${game.id}`]) {
        regular.push(game);
      }
    }

    let group = [];
    // Process premium games first
    while (premium.length) {
      group.push(premium.shift());

      if (group.length >= this._maxGroupSize) {
        this._groups.push(group);
        group = [];
      }
    }

    // Process regular games
    while (regular.length) {
      group.push(regular.shift());

      if (group.length >= this._maxGroupSize) {
        this._groups.push(group);
        group = [];
      }
    }

    // Push any remaining games into the last group
    if (group.length) {
      this._groups.push(group);
    }

    redraw();
  }

  public gameConfig(): any {
    return this._gameConfigs;
  }
}
