import { PopupComponent, IPopupAttrs } from '../../../../../../../../common/popups/PopupManager';
import { IIconSet } from '../../../../../../../../common/common';
import m, { Vnode } from 'mithril';
import { isEmptyString, uuid } from '@gamechangerinteractive/xc-backend/utils';
import { template } from './template';
import Swal from 'sweetalert2';
import './module.scss';

export interface IEditIconSetAttrs extends IPopupAttrs {
  iconSet?: IIconSet;
  iconSets: IIconSet[];
}

export class EditIconSetPopup extends PopupComponent<IEditIconSetAttrs> {
  public iconSet: IIconSet;
  public newIcons: string[] = [];
  public deletedIcons: string[] = [];

  private _iconSets: IIconSet[];
  private _isNew: boolean;

  public oninit(vnode: Vnode<IEditIconSetAttrs>) {
    super.oninit(vnode);
    this.iconSet = vnode.attrs.iconSet;
    this._iconSets = vnode.attrs.iconSets;

    if (!this.iconSet) {
      this._isNew = true;
      this.iconSet = {
        id: uuid(),
        name: '',
        icons: [],
      };
    }
  }

  public buttonAddIconsHandler() {
    // this.options.push('');
  }

  public flagForDelete(event: Event): void {
    this.deletedIcons.push((event.target as HTMLDivElement).id);
    m.redraw();
  }

  public buttonSaveHandler() {
    if (!this.validate()) {
      return;
    }

    for (const i in this.deletedIcons) {
      // TODO: determine why deleting a file from firebase does not work
      // api.deleteFile(i);
    }

    this.iconSet.icons.push(...this.newIcons);
    this.newIcons = [];
    this.iconSet.icons = this.iconSet.icons.filter((icon) => !this.deletedIcons.includes(icon));

    this.close(this.iconSet);
    m.redraw();
  }

  private validate(): boolean {
    if (isEmptyString(this.iconSet.name)) {
      Swal.fire({
        icon: 'warning',
        title: 'Please, provide a card set name',
      });
      return;
    }

    if (this._isNew && this._iconSets.some((item) => item.name.toLowerCase() === this.iconSet.name.toLowerCase())) {
      Swal.fire(`Icon set "${this.iconSet.name}" already exists`, '', 'warning');
      return;
    }

    return true;
  }

  public view({ attrs }: Vnode<IEditIconSetAttrs>) {
    return template.call(this, attrs);
  }
}
