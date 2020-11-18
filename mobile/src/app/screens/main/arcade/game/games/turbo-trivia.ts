import { ArcadeGameScreen } from '..';
import { IUser, IConfig, IntegratedGame } from '../../../../../../../../common/common';
import { Vnode } from 'mithril';
import { IAwardPointsRequest, IMessage, OutgoingEvents } from '../../../../../../../../common/types/playcanvas';
import { api } from '../../../../../services/api';

export class TurboTriviaGameScreen extends ArcadeGameScreen {
  public oninit(_vnode: Vnode) {
    super.oninit(_vnode);
    this._gameId = IntegratedGame.TURBO_TRIVIA_2;
  }

  protected async awardPoints(data: any): Promise<IMessage> {
    // TODO: Make this configurable
    const points = data.amount;
    api.submitIntegratedGamePoints(points, { gid: IntegratedGame.TURBO_TRIVIA_2 });
    api.awardPoints(points, data.leaderboards);
    return Promise.resolve({
      event: OutgoingEvents.RESPONSE,
    });
  }

  // eslint-disable-next-line
  protected async sendUserData(data: IUser): Promise<void> { }


  // eslint-disable-next-line
  protected sendConfigData(data: IConfig): void { }
}
