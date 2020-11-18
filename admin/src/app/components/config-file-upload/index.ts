import m from 'mithril';
import { ConfigControl } from '../config-control';
import { FileUpload } from '../file-upload';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export class ConfigFileUpload extends ConfigControl {
  protected valueChangeHandler(value: string) {
    if (isEmptyString(value)) {
      value = null;
    }

    super.valueChangeHandler(value);
  }

  public template(attrs) {
    return m(FileUpload, {
      ...attrs,
      value: this.value,
      isdefault: this.isDefault,
      onchange: this.valueChangeHandler.bind(this),
    });
  }
}
