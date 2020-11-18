import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface ISelectOption {
  value: string;
  label: string;
}

export interface ISelectAttrs {
  value: string;
  options: ISelectOption[];
  onChange: (val: string) => void;
  className?: string;
}

export class Select implements ClassComponent<ISelectAttrs> {
  public view(vnode: Vnode<ISelectAttrs>) {
    return template.call(this, vnode.attrs);
  }
}
