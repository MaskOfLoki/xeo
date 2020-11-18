import m, { VnodeDOM } from 'mithril';
import { ConfigControl, IConfigControlAttrs } from '../config-control';
import { TextArea } from '../textarea';

interface IConfigInputAttrs extends IConfigControlAttrs {
  defaultValue?: string;
}

export class ConfigTextArea extends ConfigControl {
  private _timer: number;
  private _attrs: IConfigInputAttrs;

  public onbeforeupdate(vnode: VnodeDOM): void {
    this._attrs = vnode.attrs as IConfigInputAttrs;
  }

  private inputChangeHandler(value: string, trim = false) {
    if (this.value === value) {
      return;
    }

    clearTimeout(this._timer);

    if (trim) {
      value = value.trim();
    }

    if (value == '') {
      this._configValue = undefined;
    } else {
      this._configValue = value;
    }

    if (
      (this._defaultValue !== null && this._configField === this._defaultValue) ||
      (this._defaultValue === null && this._configValue === this._attrs.defaultValue)
    ) {
      this._configValue = null;
    }

    // throttle config update to avoid updating on each keypress
    this._timer = window.setTimeout(this.valueChangeHandler.bind(this, this._configValue), 500);
  }

  public template(attrs: IConfigInputAttrs) {
    const inputAttrs = { ...attrs };
    delete inputAttrs.configField;
    delete inputAttrs.defaultValueField;
    const value = this.value || inputAttrs.defaultValue;

    return m(TextArea, {
      value: value,
      candelete:
        (this._defaultValue !== null && value !== this._defaultValue) ||
        (this._defaultValue === null && value !== attrs.defaultValue),
      ondelete: this.inputChangeHandler.bind(this),
      oninput: (e) => this.inputChangeHandler(e.target.value),
      onblur: (e) => this.inputChangeHandler(e.target.value, true),
      ...inputAttrs,
    });
  }
}
