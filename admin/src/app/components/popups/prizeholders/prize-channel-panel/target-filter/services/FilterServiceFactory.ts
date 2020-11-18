import { IChannel, PointsType } from '../../../../../../../../../common/common';
import {
  ICardLeadersFilter,
  IGameLeadersFilter,
  ILeadersFilter,
  ISignUpLeadersFilter,
  ITeamLeadersFilter,
} from '../../../../../../utils';
import { CardTargetService } from './CardTargetService';
import { GameTargetService } from './GameTargetService';
import { ITargetService } from './ITargetService';
import { SignUpFieldTargetService } from './SignUpFieldTargetService';
import { NullTargetService } from './NullTargetService';
import { TeamTargetService } from './TeamTargetService';

export class FilterServiceFactory {
  public static createService(channel: IChannel, filter: ILeadersFilter): ITargetService {
    switch (filter.type) {
      case PointsType.CARD: {
        return new CardTargetService(channel, filter as ICardLeadersFilter);
      }
      case PointsType.SIGN_UP: {
        return new SignUpFieldTargetService(channel, filter as ISignUpLeadersFilter);
      }
      case PointsType.GAME: {
        return new GameTargetService(channel, filter as IGameLeadersFilter);
      }
      case PointsType.TEAM: {
        return new TeamTargetService(channel, filter as ITeamLeadersFilter);
      }
    }

    return new NullTargetService(filter);
  }
}
