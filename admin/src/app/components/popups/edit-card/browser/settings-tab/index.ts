import { ClassComponent, Vnode } from 'mithril';
import { IBrowserCard } from '../../../../../../../../common/common';
import { template } from './template';

export interface ISettingsTabAttrs {
  card: IBrowserCard;
}

export class SettingsTab implements ClassComponent<ISettingsTabAttrs> {
  public view(vnode: Vnode<ISettingsTabAttrs>) {
    return template.call(this, vnode.attrs);
  }
}
