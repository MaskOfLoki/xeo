import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';
import { IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';
import { CardTypes, IGame, IntegratedGame } from '../../../../../../../common/common';
import { api } from '../../../../services/api';

export class PointsSettings implements ClassComponent<IChannelStateAttrs> {
  public selected = CardTypes.REACTIONS;
  public games: IGame[];

  public async oncreate(): Promise<void> {
    const integratedGameIds = Object.keys(IntegratedGame).map((key) => IntegratedGame[key]);
    this.games = (await api.getGames())
      .filter((item) => integratedGameIds.includes(item.id))
      .filter((item) => item.id !== IntegratedGame.FAN_FILTER_CAM);
  }

  public view({ attrs }: Vnode<IChannelStateAttrs>) {
    return template.call(this, attrs);
  }
}
