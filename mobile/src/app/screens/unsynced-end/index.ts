import { ClassBaseComponent } from '../../components/class-base';
import { Vnode, VnodeDOM } from 'mithril';
import { IConfig, IState } from '../../../../../common/common';
import { api } from '../../services/api';
import { redraw, route } from 'mithril';
import { template } from './template';
import Swal from 'sweetalert2';

export class UEndingScreen extends ClassBaseComponent {
  private _mode = 'replay';
  protected _cardRoute: string;

  public oninit(_vnode: Vnode) {
    this._cardRoute = route.param('cardRoute');
    //console.log(this._cardRoute);
  }

  public oncreate(vnode: VnodeDOM) {
    this._subscriptions.push(api.config.subscribe(this.configHandler.bind(this)));
  }

  protected stateHandler(value: IState) {
    super.stateHandler(value);
  }

  private configHandler(config: IConfig): void {
    this._mode = config?.program?.mode;
    redraw();
  }

  public view() {
    return template.call(this);
  }

  public async clickHandler() {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'REPLAY',
      text: 'Are you sure you want to replay?, any point you earned will be reset',
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    route.set(`/home/card/${this._cardRoute}`);
    //route.set('/home');
  }

  public get mode(): string {
    return this._mode;
  }
}
