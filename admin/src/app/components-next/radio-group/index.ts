import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface IRadioOption {
  label: string;
  value: string;
  attachment?: any;
}

export interface IRadioGroupAttrs {
  name: string;
  value: string;
  options: IRadioOption[];
  onChange: (val: string) => void;
  horizontal?: boolean;
}

export class RadioGroup implements ClassComponent<IRadioGroupAttrs> {
  public view({ attrs }: Vnode<IRadioGroupAttrs>) {
    return template.call(this, attrs);
  }
}
