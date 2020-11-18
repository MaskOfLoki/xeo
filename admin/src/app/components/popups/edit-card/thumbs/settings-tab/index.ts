import { ClassComponent, Vnode, redraw } from 'mithril';
import { IThumbsCard, ICard, IImageObject } from '../../../../../../../../common/common';
import { PopupManager } from '../../../../../../../../common/popups/PopupManager';
import { ImagePickerModal } from '../../../../../components-next/image-picker-modal';
import { template } from './template';

export interface ISettingsTabAttrs {
  card: IThumbsCard;
  onChange: () => void;
}

interface IDesignKeyValue {
  [key: string]: string;
}

interface IPresetData {
  images?: {
    up?: string;
    down?: string;
  };
  metadata?: {
    upImageName?: string;
    upImageSize?: string;
    downImageName?: string;
    downImageSize?: string;
  };
}

export class SettingsTab implements ClassComponent<ISettingsTabAttrs> {
  private _card: ICard;
  public upImage: IImageObject = { url: '' };
  public downImage: IImageObject = { url: '' };

  public oninit({ attrs }: Vnode<ISettingsTabAttrs>) {
    this._card = attrs.card;
    this._updateImageObjects(attrs.card as IPresetData);
  }

  public view(vnode: Vnode<ISettingsTabAttrs>) {
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

    this._setData('images', {
      [field]: img.url,
    });
    this._setData('metadata', {
      [field + 'ImageName']: img.name,
      [field + 'ImageSize']: img.size,
    });
    redraw();
  }

  private _setData(field: string, obj: IDesignKeyValue) {
    if (!this._card[field]) {
      this._card[field] = {};
    }
    this._card[field] = {
      ...this._card[field],
      ...obj,
    };
  }

  private _updateImageObjects(card: IPresetData) {
    this.upImage = {
      url: card.images?.up,
      name: card.metadata ? card.metadata['upImageName'] : '',
      size: card.metadata ? card.metadata['upImageSize'] : '',
    };
    this.downImage = {
      url: card.images?.down,
      name: card.metadata ? card.metadata['downImageName'] : '',
      size: card.metadata ? card.metadata['downImageSize'] : '',
    };
  }
}
