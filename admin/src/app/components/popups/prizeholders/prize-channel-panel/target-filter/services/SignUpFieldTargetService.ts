import { race, Subject, timer } from 'rxjs';
import { isValidFilter, OptionType } from '.';
import {
  IChannel,
  IConfig,
  IMultipleChoiceSignupField,
  SignupFieldType,
} from '../../../../../../../../../common/common';
import { api } from '../../../../../../services/api';
import { ILeadersFilter, ISignUpLeadersFilter, toPromise } from '../../../../../../utils';
import { ITargetService } from './ITargetService';
import { filter, map } from 'rxjs/operators';

export class SignUpFieldTargetService extends Subject<void> implements ITargetService {
  public readonly totalOptions = 2;
  private _fields: IMultipleChoiceSignupField[] = [];

  constructor(private _channel: IChannel, private _filter: ISignUpLeadersFilter) {
    super();
  }

  public getOptionType(index: number): OptionType {
    return OptionType.SELECT;
  }

  public getOptionValues(index: number): Promise<string[]> {
    if (index === 0) {
      return this.getFieldNames();
    } else {
      return this.getFieldValues();
    }
  }

  private async getFieldNames(): Promise<string[]> {
    let config: IConfig = await toPromise(api.config('common'));
    let fields = config.signup?.fields ?? [];

    config = await toPromise<IConfig>(
      race(
        api.config<IConfig>(this._channel.id).pipe(filter((value) => !!value?.signup)),
        timer(2000).pipe(
          map(() => {
            return {};
          }),
        ),
      ) as any,
    );
    fields = fields.concat(config.signup?.fields ?? []);
    this._fields = [];

    fields.forEach((field) => {
      if (field.type === SignupFieldType.MULTIPLE_CHOICE && !this._fields.find((item) => item.name === field.name)) {
        this._fields.push(field as IMultipleChoiceSignupField);
      }
    });

    return this._fields.map((item) => item.name);
  }

  private getFieldValues(): Promise<string[]> {
    const field = this._fields.find((item) => item.name === this._filter.field);
    return Promise.resolve(field?.options ?? []);
  }

  public getFilter(): ILeadersFilter {
    return this._filter;
  }

  public updateOption(index: number, selected: number): void {
    if (index === -1) {
      this._filter.value = undefined;
      this._filter.field = undefined;
      return;
    }

    if (index === 0) {
      this._filter.value = undefined;
      this._filter.field = this._fields[selected]?.name;
    } else {
      const field = this._fields.find((item) => item.name === this._filter.field);
      this._filter.value = field.options[selected];
    }

    this.next();
  }

  public getOptionLabel(index: number) {
    return index === 0 ? 'FIELD' : 'VALUE';
  }

  public getSelectedOption(index: number) {
    return index === 0 ? this._filter.field : this._filter.value;
  }

  public isValidFilter(): boolean {
    return isValidFilter(this._filter);
  }

  public destroy(): void {
    // TODO
  }
}
