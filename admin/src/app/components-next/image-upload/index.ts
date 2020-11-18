import { ClassComponent, Vnode, redraw } from 'mithril';
import { template } from './template';
import { fileService } from '../../services/FileService';
import Swal from 'sweetalert2';
import { IImageObject } from '../../../../../common/common';

export interface IImageUploadAttrs {
  width?: string;
  height: string;
  horizontal?: boolean;
  preview?: boolean;
  dummy?: boolean;
  className?: string;
  showBorder?: boolean;
  image?: IImageObject;
  onChange: (img: IImageObject) => void;
  onRemove: () => void;
}

const imageExtensions = '.png, .jpg, .jpeg, .svg, .gif';

export class ImageUpload implements ClassComponent<IImageUploadAttrs> {
  private _changeHandler: (img: IImageObject) => void;
  private dummy = false;

  public oninit(vnode: Vnode<IImageUploadAttrs>) {
    this.dummy = vnode.attrs.dummy;
    this._changeHandler = vnode.attrs.onChange;
  }

  public view(vnode: Vnode<IImageUploadAttrs>) {
    return template.call(this, vnode.attrs);
  }

  public async uploadFile() {
    if (this.dummy) {
      this._changeHandler && this._changeHandler(null);
      return;
    }

    const f = await fileService.select(imageExtensions);
    if (!f) {
      return;
    }

    const part = f.name.split('.').slice(-1)[0];

    if (!imageExtensions.includes(part)) {
      Swal.fire(`Can't upload that file type here. Valid extensions: ${imageExtensions}`, '', 'warning');
      return;
    }

    const url = await fileService.upload(f);

    const imageObj: IImageObject = {
      url,
      name: f.name,
      size: this.normalizeSize(f.size),
    };

    this._changeHandler(imageObj);
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
