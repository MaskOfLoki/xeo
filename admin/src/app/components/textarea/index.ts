import { ClassComponent, Vnode, VnodeDOM } from 'mithril';
import { template } from './template';

export interface ITextAreaAttrs {
  label?: string;
  maxlength?: number;
  [index: string]: any;
}

export class TextArea implements ClassComponent<ITextAreaAttrs> {
  private _textarea: HTMLTextAreaElement;

  public oncreate(vnode: VnodeDOM<ITextAreaAttrs>) {
    this._textarea = vnode.dom.querySelector('textarea');
  }

  public view({ attrs }: Vnode<ITextAreaAttrs>) {
    return template.call(this, attrs);
  }

  public get value(): string {
    return this._textarea?.value?.trim();
  }
}
