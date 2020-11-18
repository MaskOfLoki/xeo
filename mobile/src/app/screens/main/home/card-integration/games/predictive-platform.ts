import { removeColorFunctions } from '.';
import { CardIntegrationScreen } from '..';
import { IntegratedGame, IPGPCard } from '../../../../../../../../common/common';
import { IMessage, OutgoingEvents } from '../../../../../../../../common/types/playcanvas';
import { api } from '../../../../../services/api';

enum PGPEvent {
  SUBMIT_ANSWER = 'submit_answer',
  GET_SUBMITTED_ANSWER = 'get_submitted_answer',
  GET_QUESTION_ANSWERS = 'get_question_answers',
  GET_USER_ANSWERS = 'get_user_answers',
}

interface IPGPMessage {
  event: PGPEvent;
  data?: any;
}

export class PGPIntegrationScreen extends CardIntegrationScreen {
  protected async awardPoints(data: any): Promise<IMessage> {
    // TODO: Make this configurable
    const points = data.amount;
    api.submitIntegratedGamePoints(points, { gid: IntegratedGame.PGP });
    api.awardPoints(points, data.leaderboards);
    return Promise.resolve({
      event: OutgoingEvents.RESPONSE,
    });
  }

  protected async onCustomMessage(message: IPGPMessage): Promise<IMessage> {
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
    const card = this._card as IPGPCard;
    const config: any = {};
    config.colors = card.colors;
    removeColorFunctions(config.colors);
    config.colors.text1 = config.colors.text;
    config.colors.tertiary = config.colors.background;
    config.gameOverTitle = card.text.gameOverTitle;
    config.gameOverSubtitle = card.text.gameOverSubtitle;

    return config;
  }
}
