import { Vnode, ClassComponent } from 'mithril';
import { template } from './template';

export interface IInputAttrs {
  class: string;
}

export class Input implements ClassComponent<IInputAttrs> {
  public view(vnode: Vnode<IInputAttrs>) {
    return template.call(this, vnode);
  }
}
