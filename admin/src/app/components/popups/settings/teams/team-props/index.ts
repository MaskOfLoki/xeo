import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';
import { ITeamConfig } from '../../../../../../../../common/common';

export interface ITeamProps {
  team: ITeamConfig;
  onSave: (team: ITeamConfig) => void;
}

export class TeamProps implements ClassComponent<ITeamProps> {
  protected updatedTeam: ITeamConfig;
  protected originalTeam: ITeamConfig;
  protected onSave: (team: ITeamConfig) => void;

  public view({ attrs }: Vnode<ITeamProps>) {
    if (this.originalTeam != attrs.team) {
      this.updatedTeam = { ...attrs.team };
      this.originalTeam = attrs.team;
      this.onSave = attrs.onSave;
    }
    return template.call(this, attrs);
  }
}
