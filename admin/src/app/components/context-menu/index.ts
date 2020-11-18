import { Vnode, ClassComponent, VnodeDOM, redraw } from 'mithril';
import basicContext from 'basiccontext';
import 'basiccontext/dist/basicContext.min.css';
import 'basiccontext/dist/themes/default.min.css';

export interface IContextMenuItem {
  title: string;
  fn: () => void;
}

export interface IContextMenuAttrs {
  items: IContextMenuItem[];
}

export class ContextMenu implements ClassComponent<IContextMenuAttrs> {
  private _element: HTMLElement;
  private _handler: (e: Event) => void;
  private _items: IContextMenuItem[] = [];

  public oninit(vnode: Vnode<IContextMenuAttrs>) {
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate({ attrs }: Vnode<IContextMenuAttrs>) {
    this._items = attrs.items ?? [];
  }

  public oncreate(vnode: VnodeDOM<IContextMenuAttrs>) {
    this._element = vnode.dom as HTMLElement;
    this._element.addEventListener(
      'contextmenu',
      (this._handler = (e) => {
        e.preventDefault();

        if (this._items.length > 0) {
          basicContext.show(
            this._items.map((item) => {
              return {
                title: item.title,
                fn: () => {
                  item.fn();
                  redraw();
                },
              };
            }),
            e,
          );
        }
      }),
    );
  }

  public onremove() {
    this._element.removeEventListener('contextmenu', this._handler);
  }

  public view(vnode: Vnode) {
    return vnode.children;
  }
}
