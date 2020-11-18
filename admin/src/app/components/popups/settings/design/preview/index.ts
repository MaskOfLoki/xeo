import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';
import { MobilePreviewMode } from '../../../../../../../../common/common';
import { IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';

interface IPreviewMenu {
  label: string;
  mode: MobilePreviewMode;
}

export class HomeSettingsPreview implements ClassComponent<IChannelStateAttrs> {
  public readonly menus: IPreviewMenu[] = [
    {
      label: '1',
      mode: MobilePreviewMode.HOME,
    },
    {
      label: '2',
      mode: MobilePreviewMode.RANK,
    },
    {
      label: '3',
      mode: MobilePreviewMode.PRIZES,
    },
    {
      label: '4',
      mode: MobilePreviewMode.PROFILE,
    },
  ];

  public selectedMenu: IPreviewMenu = this.menus[0];

  public view({ attrs }: Vnode<IChannelStateAttrs>) {
    return template.call(this, attrs);
  }
}
