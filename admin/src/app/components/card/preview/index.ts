import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export class CardPreview implements ClassComponent {
  public view({ attrs }: Vnode) {
    return template.call(this, attrs);
  }
}
