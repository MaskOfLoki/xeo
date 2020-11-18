import { ClassComponent, Vnode } from 'mithril';
import { ICard } from '../../../../../../../../common/common';
import { template } from './template';

export interface IPointsTabAttrs {
  card: ICard;
}

export class PointsTab implements ClassComponent<IPointsTabAttrs> {
  public view(vnode: Vnode<IPointsTabAttrs>) {
    return template.call(this, vnode.attrs);
  }
}
