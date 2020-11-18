import { template } from './template';
import { ClassComponent } from 'mithril';
import { IMenu } from '../index';
import { MobilePreviewMode } from '../../../../../../../../../common/common';

export class GameSettingsPreview implements ClassComponent {
  public readonly menus: IMenu[] = [
    {
      label: '1',
      component: MobilePreviewMode.HOME,
    },
    {
      label: '2',
      component: MobilePreviewMode.RANK,
    },
    {
      label: '3',
      component: MobilePreviewMode.PRIZES,
    },
    {
      label: '4',
      component: MobilePreviewMode.PROFILE,
    },
  ];

  public selectedMenu: IMenu = this.menus[0];

  public view({ attrs }) {
    return template.call(this, attrs.channel);
  }
}
