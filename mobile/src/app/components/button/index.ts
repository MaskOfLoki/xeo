import { Vnode, ClassComponent } from 'mithril';
import { template } from './template';

export interface IButtonAttrs {
  class: string;
  disabled: boolean;
  outline: boolean;
  type: string;
}

export class Button implements ClassComponent<IButtonAttrs> {
  public view(vnode: Vnode<IButtonAttrs>) {
    return template.call(this, vnode);
  }
}
