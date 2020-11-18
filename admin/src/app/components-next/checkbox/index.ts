import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface ICheckboxAttrs {
  value: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

export class Checkbox implements ClassComponent<ICheckboxAttrs> {
  public view({ attrs }: Vnode<ICheckboxAttrs>) {
    return template.call(this, attrs);
  }
}
