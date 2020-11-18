import { PresetsSelect, IDesignPresetsAttrs } from '../presets-select';
import { Unsubscribable } from 'rxjs';
import { api } from '../../services/api';
import { getFieldValue, mergeNulls } from '../../../../../common/utils';
import { cloneObject, deepMerge } from '@gamechangerinteractive/xc-backend/utils';
import { map, filter } from 'rxjs/operators';
import { DEFAULT_PRESET_FIELDS } from '../../utils';
import deepEqual from 'fast-deep-equal';
import { loading } from '../../../../../common/loading';
import { Vnode } from 'mithril';
import { fillDefaultConfig } from '../../../../../common/common';

interface IConfigPresetsSelectAttrs extends IDesignPresetsAttrs {
  channelId: string;
  configField: string;
}

export class ConfigPresetsSelect extends PresetsSelect {
  private _subscription: Unsubscribable;
  private _configField: string;
  private _data;
  private _channelId: string;

  public oninit(vnode: Vnode<IConfigPresetsSelectAttrs>) {
    if (!vnode.attrs.channelId) {
      console.warn(`channelId isn't provided: ` + this.constructor.name);
    }

    super.oninit(vnode);

    this._channelId = vnode.attrs.channelId;
    this._configField = vnode.attrs.configField;
    this._subscription = api
      .config('common', vnode.attrs.channelId)
      .pipe(
        map((value) => getFieldValue(value, this._configField)),
        filter((value) => !deepEqual(this._data, value)),
      )
      .subscribe(this.configHandler.bind(this));
  }

  public onbeforeupdate(vnode) {
    vnode.attrs.data = this._data;
    super.onbeforeupdate(vnode);
  }

  private configHandler(data = {}) {
    this._data = fillDefaultConfig(data);
    this.update({
      type: this._type,
      data,
      onchange: this._onchange,
    });
  }

  protected callOnChange() {
    const cloneSelected = cloneObject(this._selected);
    const cloneData = cloneObject(this._data);
    DEFAULT_PRESET_FIELDS.forEach((name) => delete cloneSelected[name]);

    mergeNulls(cloneData, cloneSelected);
    deepMerge(cloneData, cloneSelected);

    if (!deepEqual(this._data, cloneData)) {
      this._data = cloneData;
      loading.wrap(api.setConfigField(this._configField, this._data, this._channelId));
    }

    super.callOnChange();
  }

  public onremove() {
    this._subscription.unsubscribe();
  }
}
