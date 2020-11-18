import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface ISplitToggleAttrs {
  value: boolean;
  onChange: (val: boolean) => void;
}

export class SplitToggle implements ClassComponent<ISplitToggleAttrs> {
  public view({ attrs }: Vnode<ISplitToggleAttrs>) {
    return template.call(this, attrs);
  }
}
