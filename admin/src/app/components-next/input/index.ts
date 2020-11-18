import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface IInputAttrs {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  multiline?: boolean;
  helperText?: string;
  showRemaining?: boolean;
  showClear?: boolean;
  max?: number;
  disabled?: boolean;
  size?: 'small' | 'default';
}

export class Input implements ClassComponent<IInputAttrs> {
  public remaining: number;
  private _changeHandler: (val: string) => void;
  private _max: number;
  private _showRemaining: boolean;

  public focused = false;

  public oninit({ attrs }: Vnode<IInputAttrs>) {
    this._max = attrs.max;
    this._changeHandler = attrs.onChange;
    this._showRemaining = attrs.showRemaining;
    this.remaining = this._max;
  }

  public view({ attrs }: Vnode<IInputAttrs>) {
    return template.call(this, attrs);
  }

  public inputChangeHandler(val: string) {
    if (this._max && val && val.length > this._max) {
      val = val.slice(0, this._max);
    }
    if (this._max && this._showRemaining) {
      this.remaining = this._max - val.length;
    }

    this._changeHandler(val);
  }
}
