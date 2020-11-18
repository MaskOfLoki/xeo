import { GAME_CONFIG_FIELDS } from '../../../../../../../common/constants/arcade';
import { ClassBaseComponent } from '../../../../components/class-base';
import { api } from '../../../../services/api';
import { config as configService } from '../../../../services/ConfigService';
import { template } from './template';
import { Vnode, route, VnodeDOM } from 'mithril';
import {
  IMessage,
  IRequest,
  IncomingEvents,
  OutgoingEvents,
  ILeaderboardRequest,
  IAwardPointsRequest,
  ILeaderEntryRequest,
} from '../../../../../../../common/types/playcanvas';
import { IConfig, IUser } from '../../../../../../../common/common';
import { getQueryParam } from '../../../../../../../common/utils/query';
import { isDeployed } from '../../../../../../../common/utils';
import styles from './module.scss';

export class ArcadeGameScreen extends ClassBaseComponent {
  protected _gameId: string;
  protected _ready = false;

  private _target: Window;
  private _messageListener: (event: MessageEvent) => Promise<void>;

  public oninit(_vnode: Vnode) {
    this._gameId = route.param('gameid');
    this._subscriptions.push(
      api.user.subscribe(this.sendUserData.bind(this)),
      api.config.subscribe(this.sendConfigData.bind(this)),
    );
  }

  public oncreate(vnode: VnodeDOM) {
    super.oncreate(vnode);

    this._messageListener = this.onMessage.bind(this);
    this._target = (vnode.dom.querySelector(`.${styles.integration_frame}`) as HTMLIFrameElement).contentWindow;
    window.addEventListener('message', this._messageListener);
  }

  public onbeforeremove(): void {
    window.removeEventListener('message', this._messageListener);
  }

  public view() {
    return template.call(this);
  }

  protected sendMessage(message: IMessage) {
    if (this._target) {
      this._target.postMessage(JSON.parse(JSON.stringify(message)), '*');
    } else {
      setTimeout(this.sendMessage.bind(this, message), 100);
    }
  }

  private async onMessage(event: MessageEvent): Promise<void> {
    const data = event.data as IRequest;

    switch (data.event) {
      case IncomingEvents.READY:
        this.onReady();
        break;
      case IncomingEvents.AWARD_POINTS:
        {
          const response = await this.awardPoints(data.data);
          response.id = data.id;
          this.sendMessage(response);
        }
        break;
      case IncomingEvents.GET_LEADERBOARD:
        {
          const response = await this.getLeaderboard(data.data);
          response.id = data.id;
          this.sendMessage(response);
        }
        break;
      case IncomingEvents.GET_LEADER_ENTRY:
        {
          const response = await this.getLeaderEntry(data.data);
          response.id = data.id;
          this.sendMessage(response);
        }
        break;
      case IncomingEvents.INIT_LEADER_ENTRY:
        {
          const response = await this.initLeaderEntry(data.data);
          response.id = data.id;
          this.sendMessage(response);
        }
        break;
      case IncomingEvents.CARD_SPECIFIC:
        {
          let response: IMessage;
          switch (data.data?.gameEvent) {
            case 'get_highscore':
              {
                response = await this.getFreeplayHighScore();
              }
              break;
            default:
            // Do nothing, we don't know what this message is.
          }

          if (response) {
            response.id = data.id;
            this.sendMessage(response);
          }
        }
        break;
      default:
        this.sendMessage({
          id: data.id,
          event: OutgoingEvents.RESPONSE,
        });
        break;
    }
  }

  private onReady(): void {
    this._ready = true;
  }

  protected sendUserData(data: IUser): void {
    if (this._ready) {
      this.sendMessage({
        event: OutgoingEvents.USER,
        data: {
          uid: data.uid,
          username: data.username,
        },
      });
    } else {
      setTimeout(this.sendUserData.bind(this, data), 100);
    }
  }

  protected sendConfigData(data: IConfig): void {
    if (this._ready) {
      let config = (data.arcade ?? {})[this._gameId] ?? {};
      config = fillDefaultGameConfig(config, this._gameId);
      this.sendMessage({
        event: OutgoingEvents.CONFIG,
        data: config,
      });
    } else {
      setTimeout(this.sendConfigData.bind(this, data), 100);
    }
  }

  protected async awardPoints(params: IAwardPointsRequest): Promise<IMessage> {
    let dif = 0;
    let scoreToAdd = params.amount;
    const freeplayLeaderboard = params.leaderboards.find((item) => item === `freeplay-${this._gameId}`);
    const entry = await api.getLeaderEntry(freeplayLeaderboard);
    if (entry.points) {
      dif = params.amount - entry.points;
      scoreToAdd = dif > 0 ? dif : 0;
    }
    const data = await api.awardPoints(scoreToAdd, [freeplayLeaderboard]);

    return {
      event: OutgoingEvents.RESPONSE,
      data,
    };
  }

  private async getLeaderboard(params: ILeaderboardRequest): Promise<IMessage> {
    const leaders = await api.getLeaders(params.leaderboard, params.limit);
    return {
      event: OutgoingEvents.RESPONSE,
      data: leaders,
    };
  }

  private async getLeaderEntry(params: ILeaderEntryRequest): Promise<IMessage> {
    const entry = await api.getLeaderEntry(params.leaderboard);
    return {
      event: OutgoingEvents.RESPONSE,
      data: entry,
    };
  }

  private async initLeaderEntry(params: ILeaderEntryRequest): Promise<IMessage> {
    const entry = await api.initLeaderEntry(params.leaderboard);
    return {
      event: OutgoingEvents.RESPONSE,
      data: entry,
    };
  }

  private async getFreeplayHighScore(): Promise<IMessage> {
    const entry = await api.getLeaderEntry(`freeplay-${this._gameId}`);
    return {
      event: OutgoingEvents.RESPONSE,
      data: {
        highscore: entry.points || 0,
      },
    };
  }

  public get url(): string {
    let value: string;
    const parts = window.location.pathname.split('/');

    if (isDeployed()) {
      value = `../${parts[1] !== 'xeo' ? '../next/' : ''}${this._gameId}?uid=${api.uid}`;
    } else {
      value = `http://localhost:8091?gcClientId=${getQueryParam('gcClientId')}&uid=${api.uid}`; // Integrated games live on 8091
    }

    return value + '&xeo';
  }
}

function fillDefaultGameConfig(config: any, gameId: string): any {
  if (!config) {
    config = {};
  }

  if (!config.colors) {
    config.colors = {};
  }

  if (!config.images) {
    config.images = {};
  }

  const defaults = GAME_CONFIG_FIELDS[gameId];

  if (defaults) {
    const colors = defaults.colors.values || [];
    for (const color of colors) {
      if (!config.colors[color.key]) {
        if ((color.default as string).startsWith('#')) {
          config.colors[color.key] = color.default;
        } else {
          config.colors[color.key] = configService.getConfig(color.default);
        }
      }
    }

    if (defaults.text) {
      const texts = defaults.text.values || [];
      if (!config.text) {
        config.text = {};
      }

      for (const text of texts) {
        if (!config.text[text.key]) {
          config.text[text.key] = text.default;
        }
      }
    }

    if (defaults.custom) {
      const custom = defaults.custom.values || [];
      if (!config.custom) {
        config.custom = {};
      }

      for (const entry of custom) {
        if (config.custom[entry.key] === undefined) {
          config.custom[entry.key] = getCustomValue(entry);
        }
      }
    }
  }

  config.mode = 'freeplay';

  return config;
}

function getCustomValue(custom) {
  switch (custom.type) {
    case 'switch':
      return custom.options[0];
    case 'toggle':
      return custom.default;
  }
}
