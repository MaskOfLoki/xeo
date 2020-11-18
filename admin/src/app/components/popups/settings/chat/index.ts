import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';
import { IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';
import { IChannel } from '../../../../../../../common/common';

export interface IChatSettings extends IChannelStateAttrs {
  onconfigimport: () => void;
}

export class ChatSettings implements ClassComponent<IChatSettings> {
  protected onconfigimport: () => void;
  protected channel: IChannel;

  public oninit({ attrs }: Vnode<IChatSettings>) {
    this.onconfigimport = attrs.onconfigimport;
    this.channel = attrs.channel;
  }

  public view({ attrs }: Vnode<IChatSettings>) {
    return template.call(this, attrs);
  }
}
