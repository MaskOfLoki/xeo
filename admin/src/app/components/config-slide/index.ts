import m from 'mithril';
import { IConfigControlAttrs, ConfigControl } from '../config-control';
import { Slide } from '../slide';

interface IConfigSlideAttrs extends IConfigControlAttrs {
  class: string;
  default: boolean;
}

export class ConfigSlide extends ConfigControl {
  public template(attrs: IConfigSlideAttrs) {
    return m(Slide, {
      selected: this._configValue !== undefined ? this._configValue : attrs.default,
      onchange: this.valueChangeHandler.bind(this),
      class: attrs.class,
      readonly: false,
    });
  }
}
