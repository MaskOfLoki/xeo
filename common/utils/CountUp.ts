import { VnodeDOM, Vnode, ClassComponent } from 'mithril';
import { CountUp as CU } from 'countup.js';

interface ICountUpAttrs {
  value: number;
  duration?: number;
  suffix?: string;
  useEasing: boolean;
}

export class CountUp implements ClassComponent<ICountUpAttrs> {
  private _element: HTMLElement;
  private _countup: CU;
  private _value: number;

  public oncreate({ dom, attrs }: VnodeDOM<ICountUpAttrs>) {
    this._value = attrs.value;
    this._element = dom as HTMLElement;

    if (!this._element) {
      console.warn('CountUp.oncreate: vnode.dom is undefined');
      return;
    }

    this._countup = new CU(this._element, this._value, {
      duration: attrs.duration ?? 2,
      suffix: attrs.suffix ?? '',
      startVal: this._value,
      useEasing: attrs.useEasing,
    });
    this._countup.start();
  }

  public onbeforeupdate({ attrs }: Vnode<ICountUpAttrs>) {
    if (!this._countup || this._value === attrs.value) {
      return;
    }

    this._value = attrs.value;
    this._countup.update(this._value);
  }

  public view(vnode: Vnode<ICountUpAttrs>) {
    return vnode.children;
  }
}
