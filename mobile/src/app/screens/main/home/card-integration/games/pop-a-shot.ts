import { CardIntegrationScreen } from '..';
import { IPopAShotCard, IState, IntegratedGame, ChannelType, CardType } from '../../../../../../../../common/common';
import { IMessage, OutgoingEvents } from '../../../../../../../../common/types/playcanvas';
import { config } from '../../../../../services/ConfigService';
import { VnodeDOM } from 'mithril';
import { api } from '../../../../../services/api';
import { fillDefaultGameConfig, removeColorFunctions } from '.';
import { isPreview } from '../../../../../../../../common/utils/query';

enum PopAShotEvent {
  COMPLETE_EVENT = 'complete_event',
}

interface IPopAShotMessage {
  event: PopAShotEvent;
  data?: any;
}

export class PopAShotIntegrationScreen extends CardIntegrationScreen {
  private _state: IState;
  private _desyncedStartOffset: number;

  public oncreate(vnode: VnodeDOM): void {
    super.oncreate(vnode);
    this.card.game = IntegratedGame.POP_A_SHOT;
  }

  protected async awardPoints(data: any): Promise<IMessage> {
    // TODO: Make this configurable
    //console.log(data.leaderboards);
    const points = data.amount;
    api.submitIntegratedGamePoints(points, { gid: IntegratedGame.POP_A_SHOT });
    api.awardPoints(points, data.leaderboards);
    return Promise.resolve({
      event: OutgoingEvents.RESPONSE,
    });
  }

  protected async onCustomMessage(message: IPopAShotMessage): Promise<IMessage> {
    return Promise.resolve({
      event: OutgoingEvents.RESPONSE,
    });
  }

  protected onReady() {
    this.sendMessage({
      event: OutgoingEvents.CONFIG,
      data: this.buildConfig(),
    });

    this.sendStateUpdate();
  }

  protected updateConfig(): void {
    super.updateConfig();

    this.sendMessage({
      event: OutgoingEvents.CONFIG,
      data: this.buildConfig(),
    });
  }

  protected async stateHandler(value: IState): Promise<void> {
    this._state = value;

    if (!this._state.channel?.synced) {
      const result = await api.getSessionPlaybackStatus();
      this._desyncedStartOffset = result.position;
    }

    this.sendStateUpdate();
  }

  private sendStateUpdate(): void {
    if (this._card?.type !== CardType.POP_A_SHOT) {
      return;
    }

    const card = this.card as IPopAShotCard;
    let startTime: number;
    if (isPreview() || this._state.channel?.type === ChannelType.MANUAL || this._state.channel?.synced) {
      startTime = this._state.startTime + this._card.startTime;
    } else {
      startTime = Date.now() - this._desyncedStartOffset + this.card.startTime;
    }

    this.sendMessage({
      event: OutgoingEvents.STATE,
      data: {
        sessionId: this._state.sid,
        startTime: startTime,
        paused: this._state.pausedTime ? true : undefined,
        currentTime: api.time(),
        timers: {
          splashScreen: card.timers.splashScreen,
          gameStart: card.timers.gameStart,
          game: card.timers.game,
        },
      },
    });
  }

  private buildConfig(): any {
    const card = this._card as IPopAShotCard;
    let cardConfig: any = {
      mode: 'event',
    };

    cardConfig.colors = card.colors;
    removeColorFunctions(cardConfig.colors);
    cardConfig.images = card.images;
    cardConfig.images.logo = config.home.images?.mainLogo;

    cardConfig = fillDefaultGameConfig(cardConfig, this.card.game);

    return cardConfig;
  }
}
