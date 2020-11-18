import { redraw, VnodeDOM } from 'mithril';
import { IIntegrationCard, IState } from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import { CardBaseScreen } from '../card-base';
import styles from './module.scss';
import { template } from './template';
import {
  ILeaderboardRequest,
  ILeaderEntryRequest,
  IMessage,
  IncomingEvents,
  IRequest,
  OutgoingEvents,
} from '../../../../../../../common/types/playcanvas';
import { isDeployed, isRTMPStream } from '../../../../../../../common/utils';
import { config } from '../../../../services/ConfigService';
import { Unsubscribable } from 'rxjs';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { getQueryParam } from '../../../../../../../common/utils/query';

export class CardIntegrationScreen extends CardBaseScreen {
  private _messageHandler: (event: MessageEvent) => void;
  private _isPlayed: boolean;

  private readonly _subscription: Unsubscribable;

  protected _frame: HTMLIFrameElement;
  protected _ready = false;

  public showChannelVideo: boolean;

  public newCardHandler() {
    api.submitCardView(this.card);
  }

  constructor() {
    super();
    this._isPlayed = false;
    this._subscription = api.state.subscribe(this.localStateHandler.bind(this));
  }

  public oncreate(vnode: VnodeDOM) {
    super.oncreate(vnode);
    this._messageHandler = (event: MessageEvent) => this.onMessage(event.data);
    this._frame = vnode.dom.querySelector(`.${styles.integration_frame}`) as HTMLIFrameElement;
    window.addEventListener('message', this._messageHandler);
  }

  public buttonPlayHandler() {
    this._isPlayed = true;
  }

  private localStateHandler(state: IState): void {
    this.showChannelVideo = !(!isRTMPStream(state?.channel?.media) && isEmptyString(state?.channel?.media as string));
    redraw();
  }

  public view() {
    return template.call(this);
  }

  public get card(): IIntegrationCard {
    return this._card as IIntegrationCard;
  }

  public get url(): string {
    let value: string;
    const parts = window.location.pathname.split('/');

    if (isDeployed()) {
      value = `../${parts[1] !== 'xeo' ? '../next/' : ''}${this.card.game}?uid=${api.uid}&xeo`;
    } else {
      value = `http://localhost:8091?gcClientId=${getQueryParam('gcClientId')}&uid=${api.uid}&xeo`; // Integrated games live on 8091
    }

    return value;
  }

  protected awardPoints(data: any): Promise<IMessage> {
    return null;
  }

  protected onCustomMessage(data: any): Promise<IMessage> {
    return null;
  }

  protected onReady(): void {
    this._ready = true;
    return;
  }

  protected sendMessage(message: IMessage) {
    if (this._frame?.contentWindow) {
      this._frame.contentWindow.postMessage(message, '*');
    } else {
      setTimeout(this.sendMessage.bind(this, message), 100);
    }
  }

  private async onMessage(data: IRequest): Promise<void> {
    switch (data.event) {
      case IncomingEvents.READY:
        this.onReady();
        break;
      case IncomingEvents.GET_LEADERBOARD:
        {
          const response = await this.getLeaderboard(data.data);
          response.id = data.id;
          this.sendMessage(response);
        }
        break;
      case IncomingEvents.AWARD_POINTS:
        {
          const enabled = `enable-${this.card.game}`;
          let response: IMessage = {} as IMessage;
          if (config.points[enabled]) {
            response = (await this.awardPoints(data.data)) || ({} as IMessage);
          }
          response.event = OutgoingEvents.RESPONSE;
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
          const response = (await this.onCustomMessage(data.data)) || ({} as IMessage);
          response.event = OutgoingEvents.RESPONSE;
          response.id = data.id;
          this.sendMessage(response);
        }
        break;
      default:
        this.sendMessage({
          id: data.id,
          event: OutgoingEvents.RESPONSE,
        });
    }
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

  public onremove(): void {
    super.onremove();
    window.removeEventListener('message', this._messageHandler);
  }

  public get isPlayed() {
    return this._isPlayed;
  }
}
