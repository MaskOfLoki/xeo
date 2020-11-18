import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface ITimerAttrs {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  size: 'small' | 'default';
}

export class Timer implements ClassComponent<ITimerAttrs> {
  private _changeHandler: (val: number) => void;

  public min = '00';
  public sec = '00';
  public focused = false;

  public oninit({ attrs }: Vnode<ITimerAttrs>) {
    const min = Math.floor(attrs.value / 60000);
    const sec = Math.ceil((attrs.value % 60000) / 1000);
    this.min = min.toString().padStart(2, '0');
    this.sec = sec.toString().padStart(2, '0');

    this._changeHandler = attrs.onChange;
  }

  public view({ attrs }: Vnode<ITimerAttrs>) {
    return template.call(this, attrs);
  }

  public minChangeHandler(val: string) {
    this.focused = false;

    if (isNaN(+val)) {
      this.min = this.min.toString();
      return;
    }

    const min = +val || 0;
    this.min = min.toString().padStart(2, '0');
    const value = min * 60000 + parseInt(this.sec) * 1000;
    this._changeHandler(value);
  }

  public secChangeHandler(val: string) {
    this.focused = false;

    if (isNaN(+val)) {
      this.sec = this.sec.toString();
      return;
    }

    const sec = +val || 0;
    this.sec = sec.toString().padStart(2, '0');
    const value = sec * 1000 + parseInt(this.min) * 60000;
    this._changeHandler(value);
  }
}
