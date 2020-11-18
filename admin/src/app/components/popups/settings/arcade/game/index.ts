import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';
import { BasicGameSettings } from './basics';
import { ImagesGameSettings } from './images';
import { CustomGameSettings } from './custom';
import { TextGameSettings } from './text';
import { IChannel } from '../../../../../../../../common/common';

export interface IArcadeGameAttrs {
  name: string;
  gid: string;
  premium: boolean;
  channel?: IChannel;
}

export interface IMenu {
  label: string;
  component;
}

export class GameSettings implements ClassComponent<IArcadeGameAttrs> {
  private _name: string;
  private _gid: string;
  private _premium: boolean;

  public readonly menus: IMenu[] = [
    {
      label: 'CUSTOM GAME SETTINGS',
      component: CustomGameSettings,
    },
    {
      label: 'COLORS & BASICS',
      component: BasicGameSettings,
    },
    {
      label: 'IMAGES',
      component: ImagesGameSettings,
    },
    {
      label: 'TEXT',
      component: TextGameSettings,
    },
  ];

  public oncreate(vnode: Vnode<IArcadeGameAttrs>): void {
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate(vnode: Vnode<IArcadeGameAttrs>): void {
    if (this._name !== vnode.attrs.name) {
      this._name = vnode.attrs.name;
    }

    if (this._gid !== vnode.attrs.gid) {
      this._gid = vnode.attrs.gid;
    }

    this._premium = vnode.attrs.premium;
  }

  public view({ attrs }): Vnode<IArcadeGameAttrs> {
    return template.call(this, attrs.channel);
  }

  public get name(): string {
    return this._name;
  }

  public get gid(): string {
    return this._gid;
  }

  public get premium(): boolean {
    return this._premium;
  }
}
