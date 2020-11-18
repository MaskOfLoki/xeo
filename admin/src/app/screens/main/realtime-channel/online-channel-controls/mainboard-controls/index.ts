import { template } from './template';
import { api } from '../../../../../services/api';
import {
  MainboardLayout,
  MainboardDisplay,
  IMainboardState,
  MainboardZone,
} from '../../../../../../../../common/common';
import { ChannelStateComponent, IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';
import { MAINBOARD_CONFIG_FIELDS } from '../../../../../../../../common/constants/mainboard';

export class MainboardControls extends ChannelStateComponent<IChannelStateAttrs> {
  private _layout: MainboardLayout = MainboardLayout.FULLSCREEN;
  private _zone: MainboardZone;
  private _fullscreen_zone: MainboardZone;
  private _sideslab_zone: MainboardZone;
  private _lower_third_zone: MainboardZone;
  private _display: MainboardDisplay;
  private _cardDisplay: MainboardDisplay;
  private _mobileLeaderboard: boolean;

  protected _suffix = 'mainboard';

  protected stateHandler(value: IMainboardState) {
    super.stateHandler(value);

    if (value.layout) {
      this._layout = value.layout;
      if (value.zone) {
        this._zone = value.zone;
      } else {
        this._zone = MAINBOARD_CONFIG_FIELDS[this._layout].defaultZone;
      }
    } else {
      this._layout = MainboardLayout.FULLSCREEN;
      this._zone = MAINBOARD_CONFIG_FIELDS[this._layout].defaultZone;
    }

    // eslint-disable-next-line
    this._fullscreen_zone = value.fullscreen_zone || MAINBOARD_CONFIG_FIELDS[MainboardLayout.FULLSCREEN].defaultZone;
    // eslint-disable-next-line
    this._sideslab_zone = value.sideslab_zone || MAINBOARD_CONFIG_FIELDS[MainboardLayout.SIDESLAB].defaultZone;
    // eslint-disable-next-line
    this._lower_third_zone = value.lower_third_zone || MAINBOARD_CONFIG_FIELDS[MainboardLayout.LOWER_THIRD].defaultZone;

    this._display = value.display;
    this._cardDisplay = value.customCard ? MainboardDisplay.CUSTOM_CARD : MainboardDisplay.CURRENT_CARD;
    this._mobileLeaderboard = value.customLeaderboard;
  }

  public mainboardLayoutChangeHandler(value: MainboardLayout) {
    this._layout = value;
    if (this._display != MainboardDisplay.LEADERBOARD) {
      this._zone = this[`_${this._layout}_zone`];
    } else {
      this._zone = MainboardZone.LEADERBOARD;
    }

    api.updateMainboardLayoutAndZone(this._layout, this._zone, this._channelId);
  }

  public mainboardZoneChangeHandler(value: MainboardZone) {
    if (this._display != MainboardDisplay.LEADERBOARD) {
      this._zone = value;
      api.updateMainboardLayoutAndZone(this._layout, this._zone, this._channelId);
    }
  }

  public async buttonDisplayHandler(value?: MainboardDisplay) {
    if (value == null) {
      if (this._display == MainboardDisplay.LEADERBOARD) {
        this._zone = MAINBOARD_CONFIG_FIELDS[this._layout].defaultZone;
      }
      value = this._cardDisplay || MainboardDisplay.CURRENT_CARD;
    } else if (value === MainboardDisplay.LEADERBOARD) {
      await api.restoreMainboardLeaders(this._channelId);
      this._zone = MainboardZone.LEADERBOARD;
    }

    api.updateMainboardDisplayLayoutZone(value, this._layout, this._zone, this._channelId);
  }

  public async toggleMobileLeaderboard() {
    const mainboardState = this._state as IMainboardState;
    mainboardState.customLeaderboard = !this._mobileLeaderboard;
    await api.sendMobileLeaderboard(mainboardState, this._channelId);
  }

  public view() {
    return template.call(this);
  }

  public get layout(): MainboardLayout {
    return this._layout;
  }

  public get zone(): MainboardZone {
    return this._zone;
  }

  public get fullscreenZone(): MainboardZone {
    return this._fullscreen_zone;
  }

  public get sideslabZone(): MainboardZone {
    return this._sideslab_zone;
  }

  public get lowerThirdZone(): MainboardZone {
    return this._lower_third_zone;
  }

  public get display(): MainboardDisplay {
    return this._display;
  }

  public get mobileLeaderboard(): boolean {
    return this._mobileLeaderboard;
  }
}
