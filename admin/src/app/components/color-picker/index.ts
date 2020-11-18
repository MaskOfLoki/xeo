import { ClassComponent, Vnode, VnodeDOM } from 'mithril';
import { template } from './template';
import { redraw } from 'mithril';
import styles from './module.scss';
import { IGradientData } from '../../../../../common/types/Gradients';
import { PopupManager } from '../../../../../common/popups/PopupManager';
import { buildGradientString } from '../../../../../common/utils';
import { cloneObject } from '@gamechangerinteractive/xc-backend/utils';
import { ColorValue } from '../../../../../common/types/Color';
import { GradientEditor } from '../popups/gradient-editor';

export interface IColorPickerAttrs {
  label: string;
  color: string;
  onchange: (color: ColorValue) => void;
  candelete?: boolean;
  ondelete?: () => void;
  gradient?: boolean;
}

export class ColorPicker implements ClassComponent<IColorPickerAttrs> {
  private _color: ColorValue = '#ff0000';
  private _gradient: boolean;
  private _onchange: (color: ColorValue) => void;
  private _ondelete: () => void;
  public candelete: boolean;

  public label: string;

  public oninit(vnode: Vnode<IColorPickerAttrs, this>) {
    this._onchange = vnode.attrs.onchange;
    this._ondelete = vnode.attrs.ondelete;
    this._gradient = vnode.attrs.gradient;
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate(vnode: Vnode<IColorPickerAttrs, this>) {
    this.label = vnode.attrs.label;
    this.candelete = vnode.attrs.candelete;

    if (this._color === vnode.attrs.color || !vnode.attrs.color) {
      return;
    }

    this._color = vnode.attrs.color;
  }

  public oncreate(vnode: VnodeDOM<IColorPickerAttrs>) {
    const pickerElement: HTMLElement = vnode.dom.querySelector(`.${styles.picker}`);
    pickerElement.onclick = () => {
      const isString = typeof this._color === 'string';
      PopupManager.show(GradientEditor, {
        data: isString ? null : cloneObject(this._color),
        defaultcolor: isString ? this._color : null,
        gradient: this._gradient,
      }).then(this.saveGradient.bind(this));
    };
  }

  public view() {
    return template.call(this);
  }

  public ondelete(event: Event) {
    event.stopPropagation();

    if (this._ondelete) {
      this._ondelete();
    }
  }

  private saveGradient(result: IGradientData) {
    if (result) {
      // If we have more than 1 step, store as a gradient
      // Otherwise just store as a color string
      if (result.steps.length > 1) {
        this._color = result;
      } else {
        this._color = result.steps[0].color;
      }

      if (this._onchange) {
        this._onchange(this._color);
      }

      redraw();
    }
  }

  public get color(): string {
    return this._gradient && typeof this._color !== 'string'
      ? buildGradientString(this._color)
      : (this._color as string);
  }
}
