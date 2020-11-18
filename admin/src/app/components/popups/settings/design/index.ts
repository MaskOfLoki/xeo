import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';
import { IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';

export class DesignSettings implements ClassComponent<IChannelStateAttrs> {
  public view({ attrs }: Vnode<IChannelStateAttrs>) {
    return template(attrs);
  }
}
