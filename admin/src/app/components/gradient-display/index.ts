import { ClassComponent, Vnode } from 'mithril';
import { ConfigControl, IConfigControlAttrs } from '../config-control';
import { template } from './template';

interface IGradientDisplayAttrs extends IConfigControlAttrs {
  defaultLeftColor: string;
  defaultRightColor: string;
}

export class GradientDisplay extends ConfigControl {
  private _defaultLeft: string;
  private _defaultRight: string;

  public oninit(vnode: Vnode<IGradientDisplayAttrs>) {
    this._defaultLeft = vnode.attrs.defaultLeftColor;
    this._defaultRight = vnode.attrs.defaultRightColor;
  }

  public template() {
    return template.call(this);
  }

  public get left(): string {
    return this.value ?? this._defaultLeft;
  }

  public get right(): string {
    return this.value2 ?? this._defaultRight;
  }
}
