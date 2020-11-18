import { Vnode, ClassComponent } from 'mithril';
import { template } from './template';

export interface IPhoneCodeSelectAttrs {
  country: string[];
  onchange: (country: string[]) => void;
}

export class PhoneCodeSelect implements ClassComponent<IPhoneCodeSelectAttrs> {
  public view({ attrs }: Vnode<IPhoneCodeSelectAttrs>) {
    return template.call(this, attrs);
  }
}
