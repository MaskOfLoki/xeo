import { ClassComponent, Vnode } from 'mithril';
import { deviceService } from '../../services/DeviceService';

export abstract class BaseScreen<T = {}> implements ClassComponent<T> {
  private _template: (_: Vnode<T>) => any;

  public oninit() {
    this._template = deviceService.isMobile ? this.mobileTemplate : this.desktopTemplate;
  }

  public view(vnode: Vnode<T>) {
    return this._template.call(this, vnode);
  }

  protected abstract get mobileTemplate(): (_: Vnode<T>) => any;
  protected abstract get desktopTemplate(): (_: Vnode<T>) => any;

  protected get template(): (_: Vnode<T>) => any {
    return this._template;
  }
}
