import { template } from './template';
import { ClassComponent, redraw } from 'mithril';
import { Unsubscribable } from 'rxjs';
import { cloneObject } from '@gamechangerinteractive/xc-backend/utils';
import { EditSignupFieldPopup } from './edit-signup-field-popup';
import { ISignupField, IConfig, IIconSet } from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import { PopupManager } from '../../../../../../../common/popups/PopupManager';
import { loading } from '../../../../../../../common/loading';
import { EditIconSetPopup } from './edit-icon-set-popup';

export const DEFAULT_FIELDS = ['Phone', 'Name', 'Email'];

export class HomeSignUpSettings implements ClassComponent {
  private _activeIconSetId: string;
  private _iconSets: IIconSet[];
  private _parentFields: ISignupField[] = [];
  private _fields: ISignupField[] = [];
  private _subscriptions: Unsubscribable[];
  private _channelId: string;

  public defaultScreen: string;

  public oninit(vnode) {
    this._channelId = vnode.attrs.channel?.id;
    if (this._channelId !== undefined) {
      this._subscriptions = [
        api.config<IConfig>('common').subscribe(this.parentFieldsHandler.bind(this)),
        api.config<IConfig>(this._channelId).subscribe(this.configHandler.bind(this)),
      ];
    } else {
      this._channelId = 'common';
      this._subscriptions = [api.config<IConfig>(this._channelId).subscribe(this.configHandler.bind(this))];
    }
  }

  public async buttonAddFieldHandler() {
    const field: ISignupField = await PopupManager.show(EditSignupFieldPopup, { fields: this.fields });

    if (!field) {
      return;
    }

    this._fields.push(field);
    this.updateFields();
    redraw();
  }

  public buttonRemoveFieldHandler(index: number) {
    this._fields.splice(index, 1);
    this.updateFields();
  }

  public async buttonEditFieldHandler(index: number) {
    const field: ISignupField = await PopupManager.show(EditSignupFieldPopup, {
      field: cloneObject(this._fields[index]),
      fields: this.fields,
    });

    if (!field) {
      return;
    }

    this._fields[index] = field;
    this.updateFields();
    redraw();
  }

  public async buttonAddIconSetHandler() {
    const iconSet: IIconSet = await PopupManager.show(EditIconSetPopup, { iconSets: this.iconSets });

    if (!iconSet) {
      return;
    }

    this._iconSets.push(iconSet);
    this._activeIconSetId = iconSet.id;
    loading.wrap(api.setConfigField('signup.activeIconSet', iconSet.id, this._channelId));
    this.updateIconSets();
    redraw();
  }

  public async buttonEditIconSetHandler() {
    const index = this._iconSets.findIndex((set) => set.id == this._activeIconSetId);
    const iconSet: IIconSet = await PopupManager.show(EditIconSetPopup, {
      iconSets: this.iconSets,
      iconSet: cloneObject(this.iconSets.find((set) => set.id === this._activeIconSetId)),
    });

    if (!iconSet) {
      return;
    }

    this._iconSets[index] = iconSet;
    this._activeIconSetId = iconSet.id;
    loading.wrap(api.setConfigField('signup.activeIconSet', iconSet.id, this._channelId));
    this.updateIconSets();
    redraw();
  }

  public buttonDeleteIconSetHandler(): void {
    const index = this._iconSets.findIndex((set) => (set.id = this._activeIconSetId));
    this._activeIconSetId = 'default';
    loading.wrap(api.setConfigField('signup.activeIconSet', this._activeIconSetId, this._channelId));
    this._iconSets.splice(index, 1);
    this.updateIconSets();
    redraw();
  }

  public changeActiveIconSet(value: Event): void {
    const activeIconSetId = (value.target as HTMLSelectElement).selectedOptions[0].value;
    loading.wrap(api.setConfigField('signup.activeIconSet', activeIconSetId, this._channelId));
  }

  private updateFields() {
    loading.wrap(api.setConfigField('signup.fields', this._fields, this._channelId));
  }

  private updateIconSets() {
    loading.wrap(api.setConfigField('signup.iconSets', this._iconSets, this._channelId));
  }

  private parentFieldsHandler(value: IConfig) {
    this._parentFields = (value.signup?.fields ?? []).concat();
    redraw();
  }

  private configHandler(value: IConfig) {
    this._fields = (value?.signup?.fields ?? []).concat();
    if (this._channelId === 'common') {
      this._iconSets = value?.signup?.iconSets ?? [];
      if (!this._iconSets.find((set) => set.id === 'default')) {
        this._iconSets.push({
          id: 'default',
          name: 'Default',
        });
      }
      this._activeIconSetId = value?.signup?.activeIconSet || 'default';
    }
    this.defaultScreen = value.signup?.defaultScreen ?? 'home';
    redraw();
  }

  public onremove() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public view({ attrs }) {
    return template.call(this, attrs);
  }

  public get activeIconSetId(): string {
    return this._activeIconSetId;
  }

  public get iconSets(): IIconSet[] {
    return this._iconSets;
  }

  public get fields(): ISignupField[] {
    return this._fields;
  }

  public get parentFields(): ISignupField[] {
    return this._parentFields;
  }
}
