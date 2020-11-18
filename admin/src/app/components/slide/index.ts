import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface ISlideAttrs {
  selected: boolean;
  onchange: (value: boolean) => void;
  class: string;
  readonly: boolean;
  title?: string;
}

export class Slide implements ClassComponent<ISlideAttrs> {
  public view(vnode: Vnode<ISlideAttrs>) {
    return template(vnode);
  }
}
