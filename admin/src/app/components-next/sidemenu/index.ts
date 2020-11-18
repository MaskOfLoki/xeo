import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface ISidemenuItem {
  key: string;
  label: string;
}

export interface ISidemenuAttrs {
  options: ISidemenuItem[];
  selectedItem: string;
  onItemSelect: (itemKey: string) => void;
}

export class Sidemenu implements ClassComponent<ISidemenuAttrs> {
  public view({ attrs }: Vnode<ISidemenuAttrs>) {
    return template.call(this, attrs);
  }
}
