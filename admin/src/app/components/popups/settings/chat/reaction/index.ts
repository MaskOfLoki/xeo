import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export class ReactionSettings implements ClassComponent {
  protected phoneNumberToTest: string;

  public view({ attrs }: Vnode) {
    return template.call(this, attrs);
  }
}
