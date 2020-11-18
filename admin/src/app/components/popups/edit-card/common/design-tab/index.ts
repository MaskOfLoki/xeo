import { ClassComponent, redraw, Vnode } from 'mithril';
import { ICard, IImageObject } from '../../../../../../../../common/common';
import { template } from './template';
import { PopupManager } from '../../../../../../../../common/popups/PopupManager';
import { ColorValue } from '../../../../../../../../common/types/Color';
import { ImagePickerModal } from '../../../../../components-next/image-picker-modal';

export interface IDesignTabAttrs {
  card: ICard;
  onChange: () => void;
}

interface IDesignKeyValue {
  [key: string]: ColorValue | string;
}

interface IPresetData {
  colors?: {
    background?: ColorValue;
    text?: string;
    divider?: ColorValue;
  };
  images?: {
    background?: string;
    divider?: string;
  };
  metadata?: {
    backgroundImageName?: string;
    backgroundImageSize?: string;
    dividerImageName?: string;
    dividerImageSize?: string;
  };
}

export class DesignTab implements ClassComponent<IDesignTabAttrs> {
  public template = '';
  public backgroundImage: IImageObject = { url: '' };
  public dividerImage: IImageObject = { url: '' };
  private _card: ICard;

  public oninit({ attrs }: Vnode<IDesignTabAttrs>) {
    this._card = attrs.card;
    this.updateImageObjects(attrs.card as IPresetData);
  }

  public view(vnode: Vnode<IDesignTabAttrs>) {
    return template.call(this, vnode.attrs);
  }

  public async openImagePickerModal(imageField: string, card: ICard) {
    await PopupManager.show(ImagePickerModal, {
      image: card[imageField],
      onSave: (img: IImageObject) => {
        this.setImage(imageField, img);
      },
    });
  }

  public setImage(field: string, img: IImageObject) {
    this[field + 'Image'] = img;

    this.setData('images', {
      [field]: img.url,
    });
    this.setData('metadata', {
      [field + 'ImageName']: img.name,
      [field + 'ImageSize']: img.size,
    });
    redraw();
  }

  public setColor(field: string, val: ColorValue) {
    this.setData('colors', {
      [field]: val,
    });
  }

  public updateFromPreset(data: IPresetData) {
    this._card.colors = data.colors;
    this._card.images = data.images;

    if (data.metadata) {
      this.setData('metadata', data.metadata);
    }

    this.updateImageObjects(data);

    redraw();
  }

  public get presetData() {
    const data: IPresetData = {
      colors: this._card.colors,
      images: this._card.images,
    };

    if (this._card.metadata) {
      data.metadata = {
        backgroundImageName: this._card.metadata['backgroundImageName'],
        backgroundImageSize: this._card.metadata['backgroundImageSize'],
        dividerImageName: this._card.metadata['dividerImageName'],
        dividerImageSize: this._card.metadata['dividerImageSize'],
      };
    }

    return data;
  }

  private setData(field: string, obj: IDesignKeyValue) {
    if (!this._card[field]) {
      this._card[field] = {};
    }
    this._card[field] = {
      ...this._card[field],
      ...obj,
    };
  }

  private updateImageObjects(card: IPresetData) {
    this.backgroundImage = {
      url: card.images?.background,
      name: card.metadata ? card.metadata['backgroundImageName'] : '',
      size: card.metadata ? card.metadata['backgroundImageSize'] : '',
    };
    this.dividerImage = {
      url: card.images?.divider,
      name: card.metadata ? card.metadata['dividerImageName'] : '',
      size: card.metadata ? card.metadata['dividerImageSize'] : '',
    };
  }
}
