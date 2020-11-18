import { redraw, Vnode } from 'mithril';
import { template } from './template';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { IPopupAttrs, PopupComponent } from '../../../../../../../../common/popups/PopupManager';
import { ISignupField, SignupFieldType, IMultipleChoiceSignupField } from '../../../../../../../../common/common';

interface IEditSignupFieldPopupAttrs extends IPopupAttrs {
  field?: ISignupField;
  fields: ISignupField[];
}

export class EditSignupFieldPopup extends PopupComponent<IEditSignupFieldPopupAttrs> {
  public field: ISignupField;
  public options: string[] = ['', ''];

  private _fields: ISignupField[] = [];
  private _isNew: boolean;

  public oninit(vnode: Vnode<IEditSignupFieldPopupAttrs>) {
    super.oninit(vnode);
    this.field = vnode.attrs.field;
    this._fields = vnode.attrs.fields;

    if (!this.field) {
      this._isNew = true;
      this.field = {
        type: SignupFieldType.STRING,
        name: '',
      };
    }

    if (this.field.type === SignupFieldType.MULTIPLE_CHOICE) {
      this.options = (this.field as IMultipleChoiceSignupField).options;
    }
  }

  public fieldTypeChangeHandler(value: SignupFieldType) {
    this.field.type = value;
  }

  public buttonAddChoiceHandler() {
    this.options.push('');
  }

  public buttonRemoveChoiceHandler(index) {
    this.options.splice(index, 1);
    redraw();
  }

  public buttonSaveHandler() {
    if (!this.validate()) {
      return;
    }

    if (this.field.type === SignupFieldType.MULTIPLE_CHOICE) {
      (this.field as IMultipleChoiceSignupField).options = this.options;
    } else {
      delete this.field['options'];
    }

    this.close(this.field);
  }

  private validate(): boolean {
    if (isEmptyString(this.field.name)) {
      Swal.fire({
        icon: 'warning',
        title: 'Please, provide a name',
      });
      return;
    }

    if (this._isNew && this._fields.some((item) => item.name.toLowerCase() === this.field.name.toLowerCase())) {
      Swal.fire({
        icon: 'warning',
        title: `Singup Field "${this.field.name}" already exists. Please, provide another name.`,
      });
      return;
    }

    if (this.field.type === SignupFieldType.MULTIPLE_CHOICE && this.options.some(isEmptyString)) {
      Swal.fire({
        icon: 'warning',
        title: 'Please, fill in all choices',
      });
      return;
    }

    return true;
  }

  public view() {
    return template.call(this);
  }
}
