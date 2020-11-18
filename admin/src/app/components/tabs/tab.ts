import { ClassComponent } from 'mithril';

interface ITabAttrs {
  label: string;
}

export class Tab implements ClassComponent<ITabAttrs> {
  public view(vnode) {
    return vnode.children;
  }
}
