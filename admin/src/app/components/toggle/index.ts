import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

interface IToggleAttrs {
  onchange: (value: boolean) => void;
  type: string;
  selected: boolean;
  readonly: boolean;
  class: string;
}

export class Toggle implements ClassComponent<IToggleAttrs> {
  private _type = 'radio';
  private _onchange: (value: boolean) => void;
  private _selected = false;
  private _readonly: boolean;
  private _class: string;

  public oninit(vnode: Vnode<IToggleAttrs, this>) {
    this._onchange = vnode.attrs.onchange;

    if (vnode.attrs.type) {
      this._type = vnode.attrs.type;
    }

    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate(vnode: Vnode<IToggleAttrs, this>) {
    this._selected = !!vnode.attrs.selected;
    this._readonly = !!vnode.attrs.readonly;
    this._class = vnode.attrs.class || '';
  }

  public clickHandler(): void {
    if (this._readonly || (this._type === 'radio' && this._selected)) {
      return;
    }

    this._selected = !this._selected;

    if (this._onchange) {
      this._onchange(this._selected);
    }
  }

  public view(vnode: Vnode) {
    return template.call(this, vnode);
  }

  public get type(): string {
    return this._type;
  }

  public get selected(): boolean {
    return this._selected;
  }

  public get readonly(): boolean {
    return this._readonly;
  }

  public get class(): string {
    return this._class;
  }
}
