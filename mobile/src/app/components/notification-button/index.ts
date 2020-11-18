import { ClassComponent, redraw, Vnode } from 'mithril';
import { Unsubscribable } from 'rxjs';
import { ICard } from '../../../../../common/common';
import { liveCard } from '../../../../../common/utils/live-card';
import { template } from './template';

export interface IXCNotificationButtonAttrs {
  onclick: () => VoidFunction;

  icon: string;
  show: boolean;
}

export class XCNotificationButton implements ClassComponent<IXCNotificationButtonAttrs> {
  private _rendered = false;

  private _timeout;

  private _clickHandler: VoidFunction;

  public icon: string;

  public show: boolean;
  public shrink: boolean;

  public classes: string;

  public oninit(vnode: Vnode<IXCNotificationButtonAttrs>): void {
    this.onbeforeupdate(vnode);
    this._clickHandler = vnode.attrs.onclick;
  }

  public onbeforeupdate({ attrs }: Vnode<IXCNotificationButtonAttrs>): void {
    this.icon = attrs.icon;

    if (this._rendered) {
      this.show = attrs.show;

      if (this.show && !this.shrink) {
        if (!this._timeout) {
          this.setShrink();
        }
      } else if (!this.show) {
        if (this._timeout) {
          clearTimeout(this._timeout);
          this._timeout = null;
        }
        setTimeout(() => {
          this.shrink = false;
          redraw();
        }, 2000);
      }
    }
  }

  public oncreate({ attrs }: Vnode<IXCNotificationButtonAttrs>): void {
    this.show = attrs.show;
    this._rendered = true;
    this.setShrink();
    setTimeout(() => redraw, 1);
  }

  public view() {
    return template.call(this);
  }

  public onClick() {
    if (this._clickHandler) {
      this._clickHandler();
    }
  }

  private setShrink(): void {
    this._timeout = setTimeout(() => {
      this.shrink = true;
      this._timeout = null;
      redraw();
    }, 10000);
  }
}
