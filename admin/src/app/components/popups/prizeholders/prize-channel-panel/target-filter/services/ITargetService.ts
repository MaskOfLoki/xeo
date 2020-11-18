import { Subscribable } from 'rxjs';
import { ILeadersFilter } from '../../../../../../utils';
import { OptionType } from './index';

export interface ITargetService extends Subscribable<void> {
  totalOptions: number;
  getOptionValues(index: number): Promise<string[]>;
  getOptionType(index: number): OptionType;
  getFilter(): ILeadersFilter;
  updateOption(index: number, selected: number): void;
  getOptionLabel(index: number): string;
  getSelectedOption(index: number): string;
  isValidFilter(): boolean;
  destroy(): void;
  pipe(...operations): Subscribable<void>;
}
