import { CardIntegrationScreen } from '..';
import { IHatShuffleCard, IState, IntegratedGame, ChannelType, CardType } from '../../../../../../../../common/common';
import { IMessage, OutgoingEvents } from '../../../../../../../../common/types/playcanvas';
import { config } from '../../../../../services/ConfigService';
import { VnodeDOM } from 'mithril';
import { api } from '../../../../../services/api';
import { fillDefaultGameConfig, removeColorFunctions } from '.';
import { isPreview } from '../../../../../../../../common/utils/query';

enum HatShuffleEvent {
  COMPLETE_EVENT = 'complete_event',
}

interface IHatShuffleMessage {
  event: HatShuffleEvent;
  data?: any;
}

export class HatShuffleIntegrationScreen extends CardIntegrationScreen {
  private _state: IState;
  private _desyncedStartOffset: number;

  public oncreate(vnode: VnodeDOM): void {
    super.oncreate(vnode);
    this.card.game = IntegratedGame.HAT_SHUFFLE;
  }

  protected async awardPoints(data: any): Promise<IMessage> {
    // TODO: Make this configurable
    const points = data.amount ? 5000 : 0;
    api.submitIntegratedGamePoints(points, { gid: IntegratedGame.HAT_SHUFFLE });
    api.awardPoints(points, data.leaderboards);
    return Promise.resolve({
      event: OutgoingEvents.RESPONSE,
    });
  }

  protected async onCustomMessage(message: IHatShuffleMessage): Promise<IMessage> {
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
    super.stateHandler(value);
    this._state = value;

    if (!this._state.channel?.synced) {
      const result = await api.getSessionPlaybackStatus();
      this._desyncedStartOffset = result.position;
    }

    this.sendStateUpdate();
  }

  private sendStateUpdate(): void {
    if (this._card?.type !== CardType.HAT_SHUFFLE) {
      return;
    }

    const card = this.card as IHatShuffleCard;
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
          reveal: card.timers.reveal,
        },
      },
    });
  }

  private buildConfig(): any {
    const card = this._card as IHatShuffleCard;
    let cardConfig: any = {
      mode: 'event',
    };

    cardConfig.colors = card.colors;
    removeColorFunctions(cardConfig.colors);
    cardConfig.images = card.images;
    cardConfig.images.logo = config.home.images?.mainLogo;

    cardConfig = fillDefaultGameConfig(cardConfig, this.card.game);

    // eslint-disable-next-line
    console.info('card config', cardConfig);

    return cardConfig;
  }
}
