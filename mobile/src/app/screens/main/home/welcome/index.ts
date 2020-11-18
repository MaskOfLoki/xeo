import { template } from './template';
import { CardBaseScreen } from '../card-base';
import { MobilePreviewMode, IState, IConfig, DEFAULT_CONFIG } from '../../../../../../../common/common';
import m, { redraw, route } from 'mithril';
import { getPreviewMode } from '../../../../../../../common/utils/query';
import { config } from '../../../../services/ConfigService';
import { orientation } from '../../../../services/OrientationService';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export class WelcomeScreen extends CardBaseScreen {
  private _online: boolean;
  private _config: IConfig;

  constructor() {
    super();
    this._subscriptions.push(config.subscribe(this.configHandler.bind(this)));
    this._subscriptions.push(orientation.subscribe(this.orientationHandler.bind(this)));
  }

  protected stateHandler(state: IState): void {
    super.stateHandler(state);

    this._online = !isEmptyString(state?.sid);
  }

  public newCardHandler() {
    this.invalidateOrientation();
  }

  private configHandler(value: IConfig) {
    this._config = value;
    this.invalidateOrientation();
  }

  private orientationHandler() {
    this.invalidateOrientation();
  }

  // TODO: not sure why do we need it here, but it caused https://gcinteractive.atlassian.net/browse/XEO-1591
  // need to remove it from WelcomeScreen, because looks like HomeScreen does the same
  private invalidateOrientation() {
    if (!this._online || !this._config || this._card) {
      return;
    }

    if (orientation.isPortrait && this._config.home.wait?.portrait) {
      route.set('/home/wait');
    } else if (!orientation.isPortrait && this._config.home.wait?.landscape) {
      route.set('/home/wait');
    }
  }

  public view() {
    // in card preview mode welcome screen appears for a moment sometimes
    // to avoid this we don't show welcome screen for card mode at all
    if (getPreviewMode() === MobilePreviewMode.CARD) {
      //console.log("previewmode in welcome");
      return m('div');
    }
    return template.call(this);
  }
}
