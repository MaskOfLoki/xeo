import m from 'mithril';
import { IConfigControlAttrs, ConfigControl } from '../config-control';
import { Toggle } from '../toggle';

interface IConfigRadioToggleAttrs extends IConfigControlAttrs {
  value: string;
  selected: boolean;
  class: string;
}

export class ConfigRadioToggle extends ConfigControl {
  public template(attrs: IConfigRadioToggleAttrs) {
    const options: any = {
      selected: this.value == attrs.value,
      type: 'radio',
      onchange: () => {
        this.valueChangeHandler(attrs.value);
      },
      class: attrs.class,
      readonly: false,
    };
    return m(Toggle, {
      ...options,
    });
  }
}
