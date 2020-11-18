import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { PointsType } from '../../../../../../../../../common/common';
import {
  ICardLeadersFilter,
  IGameLeadersFilter,
  ILeadersFilter,
  ISignUpLeadersFilter,
  ITeamLeadersFilter,
} from '../../../../../../utils';

export enum OptionType {
  SELECT,
  NUMBER,
}

export function isValidFilter(filter: ILeadersFilter) {
  switch (filter.type) {
    case PointsType.CARD: {
      const f: ICardLeadersFilter = filter as ICardLeadersFilter;
      return f.cardId != null && f.response != null;
    }
    case PointsType.SIGN_UP: {
      const f: ISignUpLeadersFilter = filter as ISignUpLeadersFilter;
      return !isEmptyString(f.field) && !isEmptyString(f.value);
    }
    case PointsType.GAME: {
      const f: IGameLeadersFilter = filter as IGameLeadersFilter;
      return !isEmptyString(f.gid) && !isEmptyString(f.condition) && f.score != null && f.score >= 0 && !isNaN(f.score);
    }

    case PointsType.TEAM: {
      const f = filter as ITeamLeadersFilter;
      return !isEmptyString(f.team);
    }
  }

  return false;
}
