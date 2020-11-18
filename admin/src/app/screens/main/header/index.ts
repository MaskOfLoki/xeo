import { template } from './template';
import './module.scss';
import { ClassComponent, Vnode } from 'mithril';
import { IChannelStateAttrs } from '../../../utils/ChannelStateComponent';
import { IChannel } from '../../../../../../common/common';

export interface IHeaderAttrs extends IChannelStateAttrs {
  onsave: (value: IChannel) => void;
  ondelete: (value: IChannel) => Promise<void>;
  onrestore: (value: IChannel) => Promise<void>;
  ondeleteexpired: () => Promise<void>;
  channels: IChannel[];
}

export class Header implements ClassComponent<IHeaderAttrs> {
  public view({ attrs }: Vnode<IHeaderAttrs>) {
    return template(attrs);
  }
}
