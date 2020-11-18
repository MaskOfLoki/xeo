import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';

export interface ITabBarAttrs {
  tabs: ITab[];
  selected: ITab;
  selectedIndex: number;
  onchange: (value: number) => void;
  label: string;
  button: string;
  onbutton: () => void;
}

export interface ITab {
  label: string;
  component;
}

export class TabBar implements ClassComponent<ITabBarAttrs> {
  public view({ attrs }: Vnode<ITabBarAttrs>) {
    return template(attrs);
  }
}
