import { ClassComponent, Vnode } from 'mithril';
import { ICard } from '../../../../../../../../common/common';
import { template } from './template';

export interface IBroadcastDelayTabAttrs {
  card: ICard;
}

export class BroadcastDelayTab implements ClassComponent<IBroadcastDelayTabAttrs> {
  public view(vnode: Vnode<IBroadcastDelayTabAttrs>) {
    return template.call(this, vnode.attrs);
  }
}
