import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

interface IPleaseRotateAttrs {
  disabled: boolean;
}

export class PleaseRotate implements ClassComponent<IPleaseRotateAttrs> {
  public view({ attrs }: Vnode<IPleaseRotateAttrs>) {
    return template(attrs.disabled);
  }
}
