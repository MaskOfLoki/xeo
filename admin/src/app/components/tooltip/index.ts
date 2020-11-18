import { ClassComponent, Vnode, VnodeDOM } from 'mithril';
import tippy from 'tippy.js';
import deepEqual from 'fast-deep-equal';

export class Tooltip implements ClassComponent {
  private _tippy;
  private _props;

  public oncreate(vnode: VnodeDOM) {
    this._props = vnode.attrs;
    this._tippy = tippy(vnode.dom, vnode.attrs);
  }

  public onbeforeremove(vnode: Vnode) {
    if (deepEqual(this._props, vnode.attrs)) {
      return;
    }

    this._props = vnode.attrs;
    this._tippy.setProps(this._props);
  }

  public view(vnode: Vnode) {
    return vnode.children;
  }
}
