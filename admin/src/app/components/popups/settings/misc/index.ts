import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';
import { IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';
import { IChannel } from '../../../../../../../common/common';

export interface IMiscSettings extends IChannelStateAttrs {
  onconfigimport: () => void;
}

export class MiscSettings implements ClassComponent<IMiscSettings> {
  protected onconfigimport: () => void;
  protected channel: IChannel;

  public oninit({ attrs }: Vnode<IMiscSettings>) {
    this.onconfigimport = attrs.onconfigimport;
    this.channel = attrs.channel;
  }

  public view({ attrs }: Vnode<IMiscSettings>) {
    return template.call(this, attrs);
  }
}
