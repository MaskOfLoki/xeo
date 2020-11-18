import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';

export interface ITeamList {
  teamNames: string[];
  selectedIndex: number;
  onTeamAdd: () => void;
  onTeamSelect: (index: number) => void;
  onTeamDelete: (index: number) => void;
}

export class TeamList implements ClassComponent<ITeamList> {
  protected teamNames: string[];
  protected selectedIndex: number;
  protected onTeamAdd: () => void;
  protected onTeamDelete: (index: number) => void;
  protected onTeamSelect: (index: number) => void;

  public view({ attrs }: Vnode<ITeamList>) {
    this.teamNames = attrs.teamNames;
    this.selectedIndex = attrs.selectedIndex;
    this.onTeamAdd = attrs.onTeamAdd;
    this.onTeamDelete = attrs.onTeamDelete;
    this.onTeamSelect = attrs.onTeamSelect;
    return template.call(this, attrs);
  }
}
