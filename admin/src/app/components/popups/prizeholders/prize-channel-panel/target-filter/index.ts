import { ClassComponent, redraw, Vnode } from 'mithril';
import { interval, Unsubscribable } from 'rxjs';
import { IChannel, PointsType } from '../../../../../../../../common/common';
import { ILeadersFilter } from '../../../../../utils';
import { FilterServiceFactory } from './services/FilterServiceFactory';
import { ITargetService } from './services/ITargetService';
import { template } from './template';
import { debounce } from 'rxjs/operators';

interface ITargetFilterAttrs {
  filter?: ILeadersFilter;
  channel: IChannel;
  onchange: (value: ILeadersFilter) => void;
}

export class TargetFilter implements ClassComponent<ITargetFilterAttrs> {
  public targets: ITarget[] = [
    {
      type: undefined,
      label: '---',
    },
    {
      type: PointsType.CARD,
      label: 'CARD',
    },
    {
      type: PointsType.SIGN_UP,
      label: 'SIGN UP',
    },
    {
      type: PointsType.GAME,
      label: 'GAME',
    },
    {
      type: PointsType.TEAM,
      label: 'TEAM',
    },
  ];

  // private teamTarget: ITarget = {
  //   type: PointsType.TEAM,
  //   label: 'TEAM',
  // };

  public service: ITargetService;
  public options: Array<string[]> = [];

  private _channel: IChannel;
  private _onchange: (value: ILeadersFilter) => void;
  private _subscription: Unsubscribable;

  public async filterTypeChangeHandler(filter: ILeadersFilter) {
    this.service && this.service.destroy();
    this._subscription && this._subscription.unsubscribe();
    this.service = FilterServiceFactory.createService(this._channel, filter);
    this.options = [...Array(this.service.totalOptions)].map(() => []);
    this.service.pipe(debounce(() => interval(500))).subscribe(this.filterChangeHandler.bind(this));

    this.options[0] = await this.service.getOptionValues(0);

    for (let i = 0; i < this.service.totalOptions; i++) {
      this.options[i] = await this.service.getOptionValues(i);
      const selectedOption = this.service.getSelectedOption(i);

      if (!selectedOption) {
        break;
      }
    }

    this._onchange && this._onchange(filter);

    redraw();
  }

  private filterChangeHandler() {
    if (this.options.length !== this.service.totalOptions) {
      this.filterTypeChangeHandler(this.service.getFilter());
      return;
    }

    if (!this._onchange) {
      return;
    }

    this._onchange(this.service.isValidFilter() ? this.service.getFilter() : undefined);
  }

  public async optionChangeHandler(index: number, selected: number) {
    this.service.updateOption(index, selected);

    if (index < this.service.totalOptions - 1) {
      index++;
      this.options[index] = await this.service.getOptionValues(index);
    }

    redraw();
  }

  public view({ attrs }: Vnode<ITargetFilterAttrs>) {
    this._channel = attrs.channel;
    this._onchange = attrs.onchange;

    if (attrs.filter) {
      if (!this.service || this.service.getFilter() !== attrs.filter) {
        this.filterTypeChangeHandler(attrs.filter);
      }
    } else if (!this.service) {
      this.filterTypeChangeHandler({ type: this.targets[0].type });
    }

    return template.call(this);
  }
}

interface ITarget {
  type: PointsType;
  label: string;
}
