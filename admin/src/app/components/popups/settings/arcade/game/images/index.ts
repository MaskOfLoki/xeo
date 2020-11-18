import { template } from './template';
import m, { ClassComponent, Vnode } from 'mithril';
import { IConfigGameSettingsAttrs } from '../basics';
import { IChannel } from '../../../../../../../../../common/common';

export class ImagesGameSettings implements ClassComponent<IConfigGameSettingsAttrs> {
  private _gameConfig: any;
  private _channel: IChannel;

  public oncreate(vnode: Vnode<IConfigGameSettingsAttrs>): void {
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate({ attrs }: Vnode<IConfigGameSettingsAttrs>): void {
    this._channel = attrs.channel;
    if (!this._gameConfig || this._gameConfig.prefix !== attrs.config.prefix) {
      this._gameConfig = attrs.config;
      m.redraw();
    }
  }

  public view(): Vnode<IConfigGameSettingsAttrs> {
    return template.call(this);
  }

  public get gameConfig(): any {
    return this._gameConfig;
  }

  public get channel(): IChannel {
    return this._channel;
  }
}
