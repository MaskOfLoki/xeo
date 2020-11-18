import { template } from './template';
import m, { ClassComponent, redraw } from 'mithril';
import { GameSettings } from './game';
import { IArcadeTab } from './arcade-vertical-tab-bar';
import { api } from '../../../../services/api';
import { SUPPORTED_PREMIUM_ARCADE_GIDS, SUPPORTED_ARCADE_GIDS, IGame } from '../../../../../../../common/common';
import { Unsubscribable } from 'rxjs';
import { IConfig } from '../../../../../../../common/common';

export class ArcadeSettings implements ClassComponent {
  public tabs: IArcadeTab[] = [];
  public games: IGame[] = [];
  public preferencesShown = true;
  public selectedTab: IArcadeTab;

  private _channelId: string;
  public defaultLayout: string;

  public oninit(vnode) {
    this._channelId = vnode.attrs.channel?.id;
    if (this._channelId !== undefined) {
      api.config<IConfig>(this._channelId).subscribe(this.configHandler.bind(this));
    } else {
      this._channelId = 'common';
      api.config<IConfig>(this._channelId).subscribe(this.configHandler.bind(this));
    }
  }

  private configHandler(value: IConfig) {
    this.defaultLayout = value.arcade?.defaultLayout ?? 'list';
    redraw();
  }

  public async oncreate(): Promise<void> {
    let gid: string;
    const games = await api.getGames();

    for (gid in SUPPORTED_PREMIUM_ARCADE_GIDS) {
      if (isNaN(Number(gid))) {
        const game = games.find((game) => game.id === gid);
        if (game) {
          this.games.push(game);
          this.tabs.push({
            label: game.name,
            gid: game.id,
            premium: true,
            component: GameSettings,
          });
        }
      }
    }

    for (gid in SUPPORTED_ARCADE_GIDS) {
      if (isNaN(Number(gid))) {
        const game = games.find((game) => game.id === gid);
        if (game) {
          this.games.push(game);
          this.tabs.push({
            label: game.name,
            gid: game.id,
            premium: false,
            component: GameSettings,
          });
        }
      }
    }

    // this.selectedTab = this._tabs[0];
    m.redraw();
  }

  public view({ attrs }) {
    return template.call(this, attrs.channel);
  }

  public showPreferences(): void {
    this.selectedTab = undefined;
    this.preferencesShown = true;
  }

  public onTabSelect(index: string): void {
    this.preferencesShown = false;
    this.selectedTab = null;
    m.redraw();

    setTimeout(() => {
      this.selectedTab = this.tabs[index];
      m.redraw();
    }, 0);
  }
}
