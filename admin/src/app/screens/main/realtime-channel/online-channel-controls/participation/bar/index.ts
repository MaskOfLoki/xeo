import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';
import { IParticipationBar } from '..';

export class ParticipationBar implements ClassComponent<IParticipationBar> {
  public view({ attrs }: Vnode<IParticipationBar>) {
    return template(attrs);
  }
}
