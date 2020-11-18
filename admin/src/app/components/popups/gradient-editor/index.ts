import { template } from './template';
import styles from './module.scss';
import { Vnode, redraw } from 'mithril';
import { Sortable } from '@shopify/draggable';
import iro from '@jaames/iro';
import {
  GradientType,
  GradientDirection,
  IGradientData,
  IGradientStep,
} from '../../../../../../common/types/Gradients';
import { IPopupAttrs, PopupComponent } from '../../../../../../common/popups/PopupManager';

export const PRESET_GRADIENTS = [
  {
    name: 'DEFAULT',
    type: GradientType.Linear,
    direction: GradientDirection.ToBottom,
  },
  {
    name: 'REVERSE',
    type: GradientType.Linear,
    direction: GradientDirection.ToTop,
  },
  {
    name: 'LEFT',
    type: GradientType.Linear,
    direction: GradientDirection.ToRight,
  },
  {
    name: 'RIGHT',
    type: GradientType.Linear,
    direction: GradientDirection.ToLeft,
  },
  {
    name: 'DIAGONAL',
    type: GradientType.Linear,
    direction: GradientDirection.ToTopRight,
  },
  {
    name: 'CIRCULAR',
    type: GradientType.Circular,
    direction: GradientDirection.FromCenter,
  },
];

interface IGradientEditorAttrs extends IPopupAttrs {
  advanced?: boolean;
  defaultcolor?: string;
  data: IGradientData;
  gradient: boolean;
}

const DEFAULT_COLOR = '#FFFFFF';

export class GradientEditor extends PopupComponent<any, IGradientData> {
  private _data: IGradientData;
  private _advanced: boolean;
  private _colorPicker: iro.ColorPicker;
  private _sorter: Sortable;

  public isGradient: boolean;
  public selectedPreset: number;
  public selectedStep: number;
  public renderSteps = true;

  public oninit(vnode: Vnode<IGradientEditorAttrs>) {
    super.oninit(vnode);
    this._data = vnode.attrs.data;
    this._advanced = vnode.attrs.advanced;
    this.isGradient = vnode.attrs.gradient;

    if (!this._data) {
      this._data = {
        type: GradientType.Linear,
        direction: GradientDirection.ToBottom,
        steps: [
          {
            color: vnode.attrs.defaultcolor || DEFAULT_COLOR,
            position: 0,
          },
        ],
      };
    }

    if (!this._advanced) {
      this.determinePreset();
    }

    this.selectedStep = 0;
  }

  public oncreate(): void {
    this._colorPicker = iro.ColorPicker(`.${styles.color_selector}`, {
      id: styles.color_wheel,
      width: 200,
      color: this._data.steps[0].color,
    });

    this._colorPicker.on('color:change', (color: iro.Color) => {
      this._data.steps[this.selectedStep].color = color.hexString;
      redraw();
    });

    this._sorter = new Sortable(document.querySelector(`.${styles.colors}`), {
      draggable: `.${styles.color}`,
      handle: `.${styles.handle}`,
      distance: 50,
      classes: {
        'container:dragging': styles.dragging,
      },
    });

    this._sorter.on('drag:stop', this.onDragComplete.bind(this));
  }

  public addStep(): void {
    this._data.steps.push({
      color: DEFAULT_COLOR,
      position: 100,
    });

    this.recalculateSteps();
    redraw();
  }

  public selectStep(idx: number): void {
    this.selectedStep = idx;
    this._colorPicker.color.set(this.steps[this.selectedStep].color);
    redraw();
  }

  public removeStep(idx: number, event: Event): void {
    if (this.steps.length > 1) {
      this.steps.splice(idx, 1);

      if (idx === this.selectedStep) {
        this.selectedStep = 0;
      } else if (idx < this.selectedStep) {
        --this.selectedStep;
      }

      this._colorPicker.color.set(this.steps[this.selectedStep].color);

      redraw();
    }

    event.cancelBubble = true;
  }

  public colorInputChange(idx: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Make sure the hex color starts with a #
    if (!value.startsWith('#')) {
      value = `#${value}`;
    }

    this.steps[idx].color = value.toUpperCase();

    setTimeout(() => {
      // Make sure a valid hex color was passed
      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
        this.steps[idx].color = value.toUpperCase();
        redraw();
      } else {
        input.value = this.steps[idx].color.toUpperCase();
      }
    }, 1500);
  }

  public setColor(idx: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Make sure the hex color starts with a #
    if (!value.startsWith('#')) {
      value = `#${value}`;
    }

    // Make sure a valid hex color was passed
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
      this.steps[idx].color = value.toUpperCase();
      redraw();
    } else {
      input.value = this.steps[idx].color.toUpperCase();
    }
  }

  public selectPreset(idx: number) {
    this.selectedPreset = idx;
    this._data.type = PRESET_GRADIENTS[this.selectedPreset].type;
    this._data.direction = PRESET_GRADIENTS[this.selectedPreset].direction;
    redraw();
  }

  public save(): void {
    this.close(this._data);
  }

  public view() {
    return template.call(this);
  }

  public get steps(): IGradientStep[] {
    return this._data.steps;
  }

  private recalculateSteps(): void {
    this.steps.forEach((step, idx) => {
      step.position = (100 / (this.steps.length - 1)) * idx;
    });
  }

  private onDragComplete() {
    setTimeout(() => {
      const newSteps = this.steps.slice(0, this.steps.length);
      const elements = document.querySelectorAll(`.${styles.color}`);
      elements.forEach((element) => {
        // Get the actual index of the element. Can't grab the index from the forEach
        // Because it doesn't return them in order
        const idx = index(element) - 1;
        const oldIdx = Number((element as HTMLElement).dataset.index);
        newSteps[idx] = this.steps[oldIdx];

        if (this.selectedStep === oldIdx) {
          this.selectedStep = idx;
        }
      });
      this._data.steps = newSteps;

      this.recalculateSteps();

      if (this.isGradient) {
        // Have to not render the steps then render them to force mithril to
        // update correctly
        this.renderSteps = false;

        setTimeout(() => {
          this.renderSteps = true;
          redraw();
        }, 0);
      }
      redraw();
    }, 0);
  }

  private determinePreset(): void {
    this.selectedPreset = PRESET_GRADIENTS.findIndex(
      (preset) => preset.type === this._data.type && preset.direction === this._data.direction,
    );
    if (this.selectedPreset === -1) {
      this.selectedPreset = 0;
      this._data.type = PRESET_GRADIENTS[0].type;
      this._data.direction = PRESET_GRADIENTS[0].direction;
    }
  }
}

function index(el) {
  if (!el) {
    return -1;
  }
  let i = 0;
  do {
    i++;
  } while ((el = el.previousElementSibling));
  return i;
}
