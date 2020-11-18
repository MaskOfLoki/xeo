import { ClassComponent, Vnode } from 'mithril';
import { IChannel } from '../../../../../../../../common/common';
import { template } from './template';

export interface IOptinSettingsAttrs {
  channel: IChannel;
}

export class OptinSettings implements ClassComponent<IOptinSettingsAttrs> {
  public view({ attrs }: Vnode<IOptinSettingsAttrs>) {
    return template.call(this, attrs);
  }
}
