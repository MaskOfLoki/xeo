import { removeColorFunctions } from '.';
import { CardIntegrationScreen } from '..';
import { IntegratedGame, ITugOfWarCard } from '../../../../../../../../common/common';
import { OutgoingEvents, IMessage } from '../../../../../../../../common/types/playcanvas';
import { api } from '../../../../../services/api';

export class TOWIntegrationScreen extends CardIntegrationScreen {
  protected async awardPoints(data: any): Promise<IMessage> {
    // TODO: Make this configurable
    const points = data.amount;
    api.submitIntegratedGamePoints(points, { gid: IntegratedGame.TUG_OF_WAR });
    api.awardPoints(points, data.leaderboards);
    return Promise.resolve({
      event: OutgoingEvents.RESPONSE,
    });
  }

  protected onReady() {
    this.sendMessage({
      event: OutgoingEvents.CONFIG,
      data: this.buildConfig(),
    });
  }

  protected updateConfig(): void {
    super.updateConfig();

    this.sendMessage({
      event: OutgoingEvents.CONFIG,
      data: this.buildConfig(),
    });
  }

  private buildConfig(): any {
    const card = this._card as ITugOfWarCard;
    const config: any = {};
    config.timers = card.timers;
    config.colors = card.colors;
    removeColorFunctions(config.colors);
    config.images = card.images;

    return config;
  }
}
