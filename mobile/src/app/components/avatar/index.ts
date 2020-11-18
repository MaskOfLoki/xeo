import { ClassComponent, Vnode, redraw } from 'mithril';
import { template } from './template';
import { Unsubscribable } from 'rxjs';
import { api } from '../../services/api';
import { map } from 'rxjs/operators';
import { IUser } from '../../../../../common/common';

export interface IAvatarAttrs {
  index: number;
}

export class Avatar implements ClassComponent<IAvatarAttrs> {
  private _index: number;
  private _url: string;
  private _subscription: Unsubscribable;

  public oninit(vnode: Vnode<IAvatarAttrs>) {
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate({ attrs }: Vnode<IAvatarAttrs>) {
    if (attrs.index == null) {
      if (!this._subscription) {
        this._subscription = api.user.subscribe(this.avatarHandler.bind(this));
      }
    } else {
      if (this._subscription) {
        this._subscription.unsubscribe();
        this._subscription = undefined;
      }

      this._index = attrs.index;
    }
  }

  private avatarHandler(value: IUser) {
    this._index = value?.avatar;
    this._url = value?.avatarUrl;
    redraw();
  }

  public onremove() {
    this._subscription?.unsubscribe();
  }

  public view(vnode) {
    return template.call(this, vnode.attrs);
  }

  public get index(): number {
    return this._index;
  }

  public get url(): string {
    return this._url;
  }
}
