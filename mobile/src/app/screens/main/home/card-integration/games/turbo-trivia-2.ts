import { CardIntegrationScreen } from '..';
import { IntegratedGame, IPGPCard } from '../../../../../../../../common/common';
import { IMessage, OutgoingEvents } from '../../../../../../../../common/types/playcanvas';
import { api } from '../../../../../services/api';

interface ITurboTrivia2Message {
  data?: any;
}

export class TurboTrivia2Screen extends CardIntegrationScreen {
  protected async awardPoints(data: any): Promise<IMessage> {
    // TODO: Make this configurable
    const points = data.amount;
    api.submitIntegratedGamePoints(points, { gid: IntegratedGame.TURBO_TRIVIA_2 });
    api.awardPoints(points, data.leaderboards);
    return Promise.resolve({
      event: OutgoingEvents.RESPONSE,
    });
  }

  protected async onCustomMessage(message: ITurboTrivia2Message): Promise<IMessage> {
    return Promise.resolve({
      event: OutgoingEvents.RESPONSE,
    });
  }
}
