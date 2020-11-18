import { ClassComponent, Vnode, VnodeDOM, redraw } from 'mithril';
import { template } from './template';

export interface IInputAttrs {
  label?: string;
  maxlength?: number;
  candelete?: boolean;
  ondelete?: (value: string) => void;
  max?: number;
  min?: number;
  [index: string]: any;
}

export class Input implements ClassComponent<IInputAttrs> {
  private _input: HTMLInputElement;
  private _ondelete: (value: string) => void;

  public canDelete: boolean;

  public oncreate(vnode: VnodeDOM<IInputAttrs>) {
    this._input = vnode.dom.querySelector('input');
    this._ondelete = vnode.attrs.ondelete;
    redraw();
  }

  public onbeforeupdate(vnode: Vnode<IInputAttrs>) {
    this.canDelete = vnode.attrs.candelete;
  }

  public view({ attrs }: Vnode<IInputAttrs>) {
    return template.call(this, attrs);
  }

  public get value(): string {
    return this._input?.value;
  }

  public get onDelete(): (value: string) => void {
    return this._ondelete;
  }
}
