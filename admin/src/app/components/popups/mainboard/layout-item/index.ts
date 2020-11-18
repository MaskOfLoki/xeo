import { ClassComponent, Vnode, redraw } from 'mithril';

import { template } from './template';
import { Unsubscribable } from 'rxjs';
import {
  IMainboardLayoutItem,
  MainboardLayout,
  MainboardZone,
  MainboardLayoutItemType,
} from '../../../../../../../common/common';
import { MAINBOARD_CONFIG_FIELDS } from '../../../../../../../common/constants/mainboard';
import { api } from '../../../../services/api';

export interface ILayoutItemAttrs {
  item: IMainboardLayoutItem;
  namespace?: string;
  layout: MainboardLayout;
  zone: MainboardZone;
}

export class LayoutItem implements ClassComponent<ILayoutItemAttrs> {
  public item: IMainboardLayoutItem;
  public layout: MainboardLayout;
  public zone: MainboardZone;
  public namespace: string;
  public type: MainboardLayoutItemType;
  public typeField: string;
  public valueField: string;

  private _subscription: Unsubscribable;

  public oninit(vnode: Vnode<ILayoutItemAttrs>) {
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate({ attrs }: Vnode<ILayoutItemAttrs>) {
    if (
      this.item == attrs.item &&
      this.layout == attrs.layout &&
      this.zone == attrs.zone &&
      this.namespace == attrs.namespace
    ) {
      return;
    }

    this.item = attrs.item;
    this.namespace = attrs.namespace;
    this.layout = attrs.layout;
    this.zone = attrs.zone;
    this.type = this.item.defaultType;

    if (this._subscription) {
      this._subscription.unsubscribe();
    }

    this.typeField = `mainboard.${MAINBOARD_CONFIG_FIELDS[this.layout].prefix}.${
      MAINBOARD_CONFIG_FIELDS[this.layout][this.zone].prefix
    }.${this.item.prefix}.type`;
    this.valueField = `mainboard.${MAINBOARD_CONFIG_FIELDS[this.layout].prefix}.${
      MAINBOARD_CONFIG_FIELDS[this.layout][this.zone].prefix
    }.${this.item.prefix}.value`;
    this._subscription = api
      .configField<MainboardLayoutItemType>(this.typeField, this.namespace)
      .subscribe(this.typeHandler.bind(this));
  }

  public onremove() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  public typeHandler(value: MainboardLayoutItemType) {
    if (value && this.type != value) {
      this.type = value;
      redraw();
    }
  }

  public view() {
    return template.call(this);
  }

  public typeChangeHandler(index) {
    api.setConfigField(this.typeField, this.item.types[index], this.namespace);
    redraw();
  }
}
