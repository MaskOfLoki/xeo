import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface IFullScreenToggleAttrs {
  value: boolean;
  onChange: (val: boolean) => void;
}

export class FullScreenToggle implements ClassComponent<IFullScreenToggleAttrs> {
  public view({ attrs }: Vnode<IFullScreenToggleAttrs>) {
    return template.call(this, attrs);
  }
}
