import { Vnode } from 'mithril';
import { template } from './template';
import { BaseEdit, IBaseEditAttrs } from '../base';
import { ISidemenuItem } from '../../../../components-next/sidemenu';
import { SettingsTab } from './settings-tab';
import { MarketingMessagesTab } from '../common/marketing-messages-tab';
import { BroadcastDelayTab } from '../common/broadcast-delay-tab';
import { DesignTab } from '../common/design-tab';

const panels = {
  settings: SettingsTab,
  marketing: MarketingMessagesTab,
  broadcast: BroadcastDelayTab,
  design: DesignTab,
};

export class EditBrowser extends BaseEdit {
  public selectedMenu = 'settings';
  public readonly sidemenuOptions: ISidemenuItem[] = [
    { key: 'settings', label: 'Settings' },
    { key: 'broadcast', label: 'Broadcast Delay' },
    { key: 'marketing', label: 'Marketing Message' },
    { key: 'design', label: 'Design' },
  ];

  public view(vnode: Vnode<IBaseEditAttrs>) {
    return template.call(this, vnode.attrs);
  }

  public get rightPanel() {
    return panels[this.selectedMenu];
  }
}
