import { Subject } from 'rxjs';
import { ITargetService } from './ITargetService';
import { IChannel, ITeamConfig } from '../../../../../../../../../common/common';
import { ILeadersFilter, ITeamLeadersFilter } from '../../../../../../utils';
import { api } from '../../../../../../services/api';
import { isValidFilter, OptionType } from './index';

export class TeamTargetService extends Subject<void> implements ITargetService {
  private _teams: ITeamConfig[];
  private _selectedTeamId: string;

  constructor(private _channel: IChannel, private _filter: ITeamLeadersFilter) {
    super();
  }

  public async getOptionValues(index: number): Promise<string[]> {
    if (!this._teams) {
      this._teams = (await api.loadChannelTeamsConfig(this._channel.id)).teams;
    }

    return this._teams.map((item) => item.name);
  }

  public getFilter(): ILeadersFilter {
    return this._filter;
  }

  public updateOption(index: number, selected: number): void {
    if (index === 0) {
      this._filter.team = this._selectedTeamId = this._teams[selected].id;
    }
    this.next();
  }

  public getOptionLabel(index: number): string {
    if (index === 0) {
      return 'TEAM';
    }
  }

  public getSelectedOption(index: number): string {
    return this._teams.find((item) => item.id === this._selectedTeamId)?.name;
  }

  public isValidFilter(): boolean {
    return isValidFilter(this._filter);
  }

  public getOptionType(index: number): OptionType {
    return OptionType.SELECT;
  }

  public destroy(): void {
    // TODO
  }

  public totalOptions = 1;
}
