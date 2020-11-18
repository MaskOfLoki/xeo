import { ClassComponent, Vnode, redraw } from 'mithril';
import { template } from './template';
import deepEqual from 'fast-deep-equal';
import { DEFAULT_PRESET_FIELDS } from '../../utils';
import { api } from '../../services/api';
import { uuid, cloneObject, isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { IPreset } from '../../../../../common/common';
import { ISelectOption } from '../select';

export interface IDesignPresetsAttrs {
  type: string;
  data;
  onchange: (data) => void;
  readonly: boolean;
  disabled: boolean;
}

export class PresetsSelect implements ClassComponent<IDesignPresetsAttrs> {
  private _presets: IPreset[] = [];
  protected _selected: IPreset;
  protected _type: string;
  protected _onchange: (data) => void;

  public oninit(vnode: Vnode<IDesignPresetsAttrs>) {
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate(vnode: Vnode<IDesignPresetsAttrs>) {
    this.update(vnode.attrs);
  }

  protected async update({ type, data, onchange }: Partial<IDesignPresetsAttrs>) {
    this._onchange = onchange;

    if (this._type !== type) {
      this._type = type;
      await this.refreshPresets();
      return;
    }

    if (!data || this._presets.length === 0) {
      return;
    }

    // find suitable preset by data
    if (!this._selected) {
      for (const preset of this._presets) {
        let match = true;

        for (const s in data) {
          if (!deepEqual(preset[s], data[s])) {
            match = false;
            break;
          }
        }

        if (match) {
          this._selected = preset;
          this.callOnChange();
          return;
        }
      }

      this._selected = this._presets[0];
      setTimeout(this.callOnChange.bind(this));
    }

    const clone = { ...data };
    clone.id = this._selected.id;
    clone.name = this._selected.name;
    clone.type = this._selected.type;

    if (!deepEqual(clone, this._selected)) {
      this._selected = clone;
      this._presets[this._presets.findIndex((item) => item.id === this._selected.id)] = this._selected;
      this.save();
    }
  }

  private async refreshPresets() {
    this._presets = await api.getPresets(this._type);

    if (this._presets.length === 0) {
      this._presets.push({
        id: uuid(),
        name: 'DEFAULT',
        type: this._type,
      });
    }

    if (this._selected) {
      this._selected = this._presets.find((item) => item.id === this._selected.id);
      this.callOnChange();
    }

    redraw();
  }

  public async buttonSaveAsHandler() {
    const result = await Swal.fire({
      title: 'Preset Name',
      input: 'text',
      inputValue: `${this._selected.name} Copy`,
      showCancelButton: true,
      inputValidator: (value: string) => {
        if (value.length > 20) {
          return 'Please only use 20 characters to label your preset.';
        } else if (this._presets.find((preset) => preset.name.toLowerCase() === value.toLowerCase())) {
          return `${value} already exists. Please, provide another name`;
        }
      },
    });

    if (isEmptyString(result.value)) {
      return;
    }

    const preset = cloneObject(this._selected);
    preset.name = result.value;
    preset.id = uuid();
    await api.savePreset(preset);
    this._presets.push(preset);
    this._selected = preset;
    this.callOnChange();
    redraw();
  }

  public presetChangeHandler(val: string) {
    this._selected = this._presets.find((p) => p.id === val);
    this.save();
    this.callOnChange();
  }

  public buttonResetHandler() {
    for (const s in this._selected) {
      if (!DEFAULT_PRESET_FIELDS.includes(s)) {
        delete this._selected[s];
      }
    }

    this.save();
    this.callOnChange();
  }

  public async buttonDeleteHandler() {
    const result = await Swal.fire({
      title: `Are you sure you want to delete ${this._selected.name}?`,
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    this._presets.splice(this._presets.indexOf(this._selected), 1);
    await api.deletePreset(this._selected);
    this._selected = this._presets[0];
    this.callOnChange();
  }

  protected callOnChange() {
    if (this._onchange && this._selected) {
      this._onchange(cloneObject(this._selected));
    }

    redraw();
  }

  private save() {
    api.savePreset(this._selected);
  }

  public view({ attrs }: Vnode<IDesignPresetsAttrs>) {
    return template.call(this, attrs);
  }

  public get presets(): IPreset[] {
    return this._presets;
  }

  public get presetOptions(): ISelectOption[] {
    return this._presets.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  }

  public get selected(): IPreset {
    return this._selected;
  }
}
