import { Vnode } from 'mithril';
import { template } from './template';
import { BaseEdit, IBaseEditAttrs } from '../base';
import { ISidemenuItem } from '../../../../components-next/sidemenu';
import { SettingsTab } from './settings-tab';
import { MarketingMessagesTab } from '../common/marketing-messages-tab';
import { BroadcastDelayTab } from '../common/broadcast-delay-tab';
import { DesignTab } from '../common/design-tab';
import { PointsTab } from '../common/points-tab';

const panels = {
  settings: SettingsTab,
  marketing: MarketingMessagesTab,
  broadcast: BroadcastDelayTab,
  design: DesignTab,
  points: PointsTab,
};

export class EditThumbs extends BaseEdit {
  public selectedMenu = 'settings';
  public readonly sidemenuOptions: ISidemenuItem[] = [
    { key: 'settings', label: 'Settings' },
    { key: 'broadcast', label: 'Broadcast Delay' },
    { key: 'marketing', label: 'Marketing Message' },
    { key: 'design', label: 'Design' },
    { key: 'point', label: 'Points' },
  ];

  public view({ attrs }: Vnode<IBaseEditAttrs>) {
    return template.call(this, attrs);
  }

  public get rightPanel() {
    return panels[this.selectedMenu];
  }
}
