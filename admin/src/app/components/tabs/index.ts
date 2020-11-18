import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';
import { ITab } from '../tab-bar';

export interface ITabsAttrs {
  title: string;
  onchange?: (index: number) => void;
  button: string;
  onbutton: () => void;
  ref?: (value: Tabs) => void;
}

export class Tabs implements ClassComponent<ITabsAttrs> {
  public selectedTab: number;

  private _tabs: ITab[] = [];

  public oninit(vnode: Vnode<ITabsAttrs>) {
    this.onbeforeupdate(vnode);

    if (vnode.attrs.ref) {
      vnode.attrs.ref(this);
    }
  }

  public onbeforeupdate(vnode: Vnode<ITabsAttrs>) {
    const tabs = (vnode.children as Array<Vnode<ITab>>).map((item) => {
      return {
        label: item.attrs.label,
        component: undefined,
      };
    });

    if (this._tabs.length !== tabs.length) {
      this._tabs = tabs;
    }

    if (!this.selectedTab) {
      this.selectedTab = 0;
    }
  }

  public view(vnode: Vnode<ITabsAttrs>) {
    return template.call(this, vnode);
  }

  public get tabs(): ITab[] {
    return this._tabs;
  }
}
