import { template } from './template';
import { ClassComponent, redraw } from 'mithril';
import { IConfig } from '../../../../../../../common/common';
import { api } from '../../../../services/api';

export class ProgramSettings implements ClassComponent {
  private _channelId: string;
  public defaultMode: string;

  public oninit(vnode) {
    this._channelId = vnode.attrs.channel?.id;
    if (this._channelId !== undefined) {
      api.config<IConfig>(this._channelId).subscribe(this.configHandler.bind(this));
    } else {
      this._channelId = 'common';
      api.config<IConfig>(this._channelId).subscribe(this.configHandler.bind(this));
    }
  }

  private configHandler(value: IConfig) {
    this.defaultMode = value.program?.mode ?? 'replay';
    redraw();
  }

  public view({ attrs }) {
    return template.call(this, attrs.channel);
  }
}
