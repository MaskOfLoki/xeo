import { Vnode, ClassComponent } from 'mithril';
import { template } from './template';

export interface ITextAreaAttrs {
  class: string;
}

export class TextArea implements ClassComponent<ITextAreaAttrs> {
  public view(vnode: Vnode<ITextAreaAttrs>) {
    return template.call(this, vnode);
  }
}
