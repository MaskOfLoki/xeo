import m, { ClassComponent, redraw, route, Vnode } from 'mithril';
import { IGCRouteAttrs } from './GCRoute';

export class GCRouter implements ClassComponent {
  private _component;
  private _route: string;

  public onbeforeupdate(vnode: Vnode) {
    if (route.get() === this._route) {
      return;
    }

    this._component = undefined;
    this._route = route.get();

    const componentFn = (vnode.children as Array<{ attrs: IGCRouteAttrs }>).find(
      (item) => item.attrs.route === this._route,
    )?.attrs?.component;

    if (componentFn) {
      componentFn().then((component) => {
        this._component = component;
        redraw();
      });
    }
  }

  public view() {
    if (this._component) {
      return m(this._component);
    }
  }
}
