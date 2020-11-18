import { Observable, Subject } from 'rxjs';
import { isValidFilter, OptionType } from '.';
import { GAME_ID, IChannel, IGame } from '../../../../../../../../../common/common';
import { api } from '../../../../../../services/api';
import { IGameLeadersFilter, ILeadersFilter } from '../../../../../../utils';
import { ITargetService } from './ITargetService';

export class GameTargetService extends Subject<void> implements ITargetService {
  public readonly totalOptions: number = 3;
  private _games: IGame[];
  private _conditions: string[] = ['=', '>', '<'];

  constructor(private _channel: IChannel, private _filter: IGameLeadersFilter) {
    super();
    Observable;
  }

  public async getOptionValues(index: number): Promise<string[]> {
    if (index === 0) {
      this._games = await api.getGames();
      this._games = this._games.filter((game) => game.id !== GAME_ID);
      return this._games.map((item) => item.name);
    } else if (index === 1) {
      return this._conditions;
    } else {
      return [...Array(101)].map((_, index) => (index * 100).toString());
    }
  }

  public getFilter(): ILeadersFilter {
    return this._filter;
  }

  public updateOption(index: number, selected: number): void {
    if (index === 0) {
      this._filter.gid = this._games[selected]?.id;
    } else if (index === 1) {
      this._filter.condition = this._conditions[selected];
    } else {
      this._filter.score = selected;
    }

    this.next();
  }

  public getOptionLabel(index: number): string {
    if (index === 0) {
      return 'GAME';
    } else if (index === 1) {
      return 'CONDITION';
    } else {
      return 'SCORE';
    }
  }

  public getSelectedOption(index: number): string {
    if (index === 0) {
      return this._games.find((item) => item.id === this._filter.gid)?.name;
    } else if (index === 1) {
      return this._filter.condition;
    } else {
      return this._filter.score?.toString();
    }
  }

  public isValidFilter(): boolean {
    return isValidFilter(this._filter);
  }

  public getOptionType(index: number): OptionType {
    return index === 2 ? OptionType.NUMBER : OptionType.SELECT;
  }

  public destroy(): void {
    // TODO
  }
}
