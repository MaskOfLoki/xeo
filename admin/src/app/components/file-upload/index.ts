import { template } from './template';
import { ClassComponent, redraw, Vnode } from 'mithril';
import { fileService } from '../../services/FileService';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';

type FileUploadType = 'image' | 'video' | 'sound' | 'font';

const extensions = {
  image: '.png, .jpg, .jpeg, .svg, .gif',
  video: '.mp4',
  sound: '.mp3',
  font: '.otf, .ttf',
  imageOrVideo: '.png, .jpg, .jpeg, .svg, .gif, .mp4',
};

const mimeToExtSpecial = {
  'svg+xml': 'svg',
  'font-sfnt': 'otf',
};

interface IFileUploadAttrs {
  title: string;
  subtitle: string;
  value: string;
  isdefault: boolean;
  type: FileUploadType;
  onchange: (value?: string) => void;
  class: string;
  maxsize: number | string;
  multipleFiles?: boolean;
}

export class FileUpload implements ClassComponent<IFileUploadAttrs> {
  private _value: string;
  private _type: FileUploadType;
  private _maxsize = 25;
  private _onchange: (value?: string) => void;
  private _class: string;
  private _multipleFiles = false;
  public isDefault: boolean;

  public oninit(vnode: Vnode<IFileUploadAttrs>) {
    this._onchange = vnode.attrs.onchange;
    this._type = vnode.attrs.type || 'image';
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate({ attrs }: Vnode<IFileUploadAttrs>) {
    this._onchange = attrs.onchange;
    this._value = attrs.value;
    this.isDefault = attrs.isdefault;
    this._class = attrs.class || '';
    let maxsize = parseInt(attrs.maxsize as string);
    this._multipleFiles = attrs.multipleFiles;

    if (isNaN(maxsize) || maxsize <= 0) {
      maxsize = 25;
    }

    this._maxsize = maxsize;
  }

  public async clickHandler() {
    let files: File[];
    if (this._multipleFiles) {
      files = await fileService.selectMulti(extensions[this._type]);
    } else {
      files = [await fileService.select(extensions[this._type])];
    }

    if (!files) {
      return;
    }

    for (const f of files) {
      const part = f.name.split('.').slice(-1)[0];

      if (!this.validMimeType(mimeToExtSpecial[part] ?? part)) {
        Swal.fire(`Can't upload that file type here. Valid extensions: ${extensions[this._type]}`, '', 'warning');
        return;
      }

      if (f.size / 1024 / 1024 > this._maxsize) {
        Swal.fire(`Maximum file size is ${this._maxsize} MB`, '', 'warning');
        return;
      }

      this._value = await fileService.upload(f);

      if (this._onchange) {
        this._onchange(this._value);
      }
    }

    redraw();
  }

  public buttonDeleteHandler(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (isEmptyString(this.value)) {
      return;
    }

    if (this._onchange) {
      this._onchange();
    }
  }

  public view(vnode: Vnode<IFileUploadAttrs>) {
    return template.call(this, vnode.attrs);
  }

  public get value(): string {
    return this._value;
  }

  public get class(): string {
    return this._class;
  }

  private validMimeType(type: string): boolean {
    if (!type) {
      return;
    }

    type = type.toLowerCase();
    return extensions[this._type].includes(type);
  }
}
