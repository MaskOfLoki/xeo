import { Subject } from 'rxjs';
import { ITargetService } from './ITargetService';
import { ILeadersFilter } from '../../../../../../utils';
import { OptionType } from './index';

export class NullTargetService extends Subject<void> implements ITargetService {
  public readonly totalOptions: number = 2;

  constructor(private _filter: ILeadersFilter) {
    super();
  }

  public destroy(): void {
    // nothing to do here
  }

  public getFilter(): ILeadersFilter {
    return this._filter;
  }

  public getOptionLabel(index: number): string {
    return '------';
  }

  public getOptionType(index: number): OptionType {
    return OptionType.SELECT;
  }

  public getOptionValues(index: number): Promise<string[]> {
    return Promise.resolve([]);
  }

  public getSelectedOption(index: number): string {
    return '';
  }

  public isValidFilter(): boolean {
    return false;
  }

  public updateOption(index: number, selected: number): void {
    // nothing to do here
  }
}
