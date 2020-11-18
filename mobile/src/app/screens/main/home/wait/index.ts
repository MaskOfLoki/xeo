import { template } from './template';
import { CardBaseScreen } from '../card-base';
import { route, redraw } from 'mithril';
import { config } from '../../../../services/ConfigService';
import { orientation } from '../../../../services/OrientationService';
import { api } from '../../../../services/api';
import { IState, ChannelType } from '../../../../../../../common/common';

export class WaitScreen extends CardBaseScreen {
  public isTimeline: boolean;
  constructor() {
    super();
    this._subscriptions.push(api.state.subscribe(this.stateHandler.bind(this)));
    this._subscriptions.push(config.subscribe(this.configAndOrientationChangeHandler.bind(this)));
    this._subscriptions.push(orientation.subscribe(this.configAndOrientationChangeHandler.bind(this)));
  }

  public newCardHandler() {
    // TODO
  }

  private configAndOrientationChangeHandler() {
    if (orientation.isPortrait && !config.home.wait?.portrait) {
      //console.log("configAndOrientationChangeHandler home1");
      route.set('/home');
    } else if (!orientation.isPortrait && !config.home.wait?.landscape) {
      //console.log("configAndOrientationChangeHandler home2");
      route.set('/home');
    }
  }

  public stateHandler(state: IState): void {
    const istimeline = state?.channel?.type === ChannelType.TIMELINE;
    if (this.isTimeline !== istimeline) {
      this.isTimeline = istimeline;
      redraw();
    }
  }

  public view() {
    return template.call(this);
  }
}
