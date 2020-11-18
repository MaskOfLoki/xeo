import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';
import { api } from '../../../../../services/api';
import { IConfig, IChannel } from '../../../../../../../../common/common';
import { Unsubscribable } from 'rxjs';

export interface IArcadeVerticalTabBarAttrs {
  tabs: IArcadeTab[];
  selected: IArcadeTab;
  selectedIndex: number;
  channel: IChannel;
  onchange: (value: number) => void;
  label: string;
  button: string;
  onbutton: () => void;
}

export interface IArcadeTab {
  gid: string;
  premium?: boolean;
  label: string;
  component;
}

export class ArcadeVerticalTabBar implements ClassComponent<IArcadeVerticalTabBarAttrs> {
  private _subscription: Unsubscribable;
  public config: IConfig;

  public oncreate(vnode: Vnode<IArcadeVerticalTabBarAttrs>): void {
    this._subscription = api.config(vnode.attrs.channel?.id ?? 'common').subscribe(this.configHandler.bind(this));
  }

  public configHandler(value): void {
    this.config = value;
  }

  public view({ attrs }: Vnode<IArcadeVerticalTabBarAttrs>) {
    return template.call(this, attrs);
  }

  public onremove(): void {
    this._subscription.unsubscribe();
  }
}
