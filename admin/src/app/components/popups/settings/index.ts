import { template } from './template';
import { DesignSettings } from './design';
import { CredentialSettings } from './credential';
import { MiscSettings } from './misc';
import { ChatSettings } from './chat';
import { LeaderboardSettings } from './leaderboard';
import { MarketingSettings } from './marketing';
import { PointsSettings } from './points';
import { HomeSignUpSettings } from './home-signup';
import { ArcadeSettings } from './arcade';
import { Vnode } from 'mithril';
import { TermsConditionsSettings } from './terms_conditions';
import { IPopupAttrs, PopupComponent } from '../../../../../../common/popups/PopupManager';
import { IChannelStateAttrs } from '../../../utils/ChannelStateComponent';
import { StreamSettings } from './streaming';
import { SmsSettings } from './sms';
import { TeamsSettings } from './teams';
import { api } from '../../../services/api';
import { ProgramSettings } from './program';

interface IMenuItem {
  label: string;
  component;
}

interface ISettingsPopupAttrs extends IPopupAttrs, IChannelStateAttrs {}

export class SettingsPopup extends PopupComponent<ISettingsPopupAttrs> {
  public menus: IMenuItem[] = [
    {
      label: 'DESIGN',
      component: DesignSettings,
    },
    {
      label: 'HOME & SIGN UP',
      component: HomeSignUpSettings,
    },
    {
      label: 'LEADERBOARD',
      component: LeaderboardSettings,
    },
    {
      label: 'TEAMS',
      component: TeamsSettings,
    },
    {
      label: 'POINTS',
      component: PointsSettings,
    },
    {
      label: 'MARKETING',
      component: MarketingSettings,
    },
    {
      label: 'ARCADE',
      component: ArcadeSettings,
    },
    {
      label: 'MISC',
      component: MiscSettings,
    },
    {
      label: 'CHAT',
      component: ChatSettings,
    },
    {
      label: 'TERMS AND CONDITIONS',
      component: TermsConditionsSettings,
    },
    {
      label: 'CREDENTIALS',
      component: CredentialSettings,
    },
    {
      label: 'Program Mode',
      component: ProgramSettings,
    },
    {
      label: 'STREAMING',
      component: StreamSettings,
    },
    {
      label: 'TEXT MESSAGES',
      component: SmsSettings,
    },
  ];

  public selectedMenu: IMenuItem = this.menus[5];

  public oninit(vnode: Vnode<ISettingsPopupAttrs>) {
    super.oninit(vnode);
    if (vnode.attrs.channel) {
      this.menus = this.menus.splice(0, this.menus.length - 3);
    }
    // else {
    //   this.menus.splice(
    //     this.menus.findIndex((menu) => menu.label === 'MARKETING'),
    //     1,
    //   );
    // }
  }

  public onConfigImport(): void {
    this.close(true);
  }

  public view({ attrs }: Vnode<ISettingsPopupAttrs>) {
    return template.call(this, attrs);
  }
}
