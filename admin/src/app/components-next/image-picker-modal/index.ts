import { Vnode, redraw } from 'mithril';
import Swal from 'sweetalert2';
import { template } from './template';
import { fileService } from '../../services/FileService';
import { PopupComponent, IPopupAttrs } from '../../../../../common/popups/PopupManager';
import { IImageObject, EMPTY_IMAGE } from '../../../../../common/common';

export interface IImagePickerModalAttrs extends IPopupAttrs {
  image?: IImageObject;
  onSave: (img: IImageObject) => void;
}

const imageExtensions = '.png, .jpg, .jpeg, .svg, .gif';

export class ImagePickerModal extends PopupComponent<any, IImagePickerModalAttrs> {
  private _saveHandler: (img: IImageObject) => void;

  public imageObj: IImageObject;
  public changed = false;
  public dragging = false;

  public oninit(vnode: Vnode<IImagePickerModalAttrs>) {
    super.oninit(vnode);

    this.imageObj = vnode.attrs.image || EMPTY_IMAGE;
    this._saveHandler = vnode.attrs.onSave;
  }

  public view() {
    return template.call(this);
  }

  public async uploadFile() {
    const f = await fileService.select(imageExtensions);
    if (!f) {
      return;
    }

    await this.uploadFileToCloud(f);
  }

  public save() {
    if (this.changed) {
      this._saveHandler && this._saveHandler(this.imageObj);
      this.close();
    }
  }

  public dragover(ev: any) {
    ev.preventDefault();
    this.dragging = true;
  }

  public async drop(ev: any) {
    ev.preventDefault();
    this.dragging = false;

    const f = ev.dataTransfer.files[0];
    if (!f) {
      return;
    }

    await this.uploadFileToCloud(f);
  }

  private async uploadFileToCloud(f: File) {
    const part = f.name.split('.').slice(-1)[0];

    if (!imageExtensions.includes(part)) {
      Swal.fire(`Can't upload that file type here. Valid extensions: ${imageExtensions}`, '', 'warning');
      return;
    }

    const url = await fileService.upload(f);

    this.imageObj = {
      url,
      name: f.name,
      size: this.normalizeSize(f.size),
    };
    this.changed = true;

    redraw();
  }

  private normalizeSize(size: number) {
    if (size < 1024) {
      return size + ' bytes';
    }

    size /= 1024;
    if (size < 1024) {
      return Math.ceil(size) + 'KB';
    }

    size /= 1024;
    if (size < 1024) {
      return Math.ceil(size) + 'MB';
    }

    size /= 1024;
    return size.toFixed(2) + 'GB';
  }
}
