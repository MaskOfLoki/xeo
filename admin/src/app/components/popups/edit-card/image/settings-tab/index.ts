import { ClassComponent, redraw, Vnode } from 'mithril';
import { ICard, IImageCard, IImageObject } from '../../../../../../../../common/common';
import { PopupManager } from '../../../../../../../../common/popups/PopupManager';
import { ImagePickerModal } from '../../../../../components-next/image-picker-modal';
import { IDesignTabAttrs } from '../../common/design-tab';
import { template } from './template';

export interface ISettingsTabAttrs {
  card: IImageCard;
  onChange: () => void;
}

interface IImageKeyValue {
  [key: string]: string;
}

export class SettingsTab implements ClassComponent<ISettingsTabAttrs> {
  private _card: IImageCard;
  public image: IImageObject = { url: '' };
  private _onchange: () => void;

  public oninit({ attrs }: Vnode<ISettingsTabAttrs>) {
    this._card = attrs.card;
    this.image = {
      url: this._card.images?.portrait,
      name: this._card.metadata ? this._card.metadata['portraitImageName'] : '',
      size: this._card.metadata ? this._card.metadata['portraitImageSize'] : '',
    };
    this._onchange = attrs.onChange;
  }

  public view(vnode: Vnode<ISettingsTabAttrs>) {
    return template.call(this, vnode.attrs);
  }

  public async openImagePickerModal(card: IImageCard) {
    await PopupManager.show(ImagePickerModal, {
      image: card.imagePortrait,
      onSave: (img: IImageObject) => {
        this.setImage(img);
      },
    });
  }

  public setImage(img: IImageObject) {
    this.image = img;

    this._card.imagePortrait = img.url;

    this.setData('images', {
      portrait: img.url,
    });
    this.setData('metadata', {
      portraitImageName: img.name,
      portraitImageSize: img.size,
    });
    this._onchange();
    redraw();
  }

  public setAttr(field: string): Function {
    return (value: string | number) => {
      this._card[field] = value;
      this._onchange();
      redraw();
    };
  }

  private setData(field: string, obj: IImageKeyValue) {
    if (!this._card[field]) {
      this._card[field] = {};
    }
    this._card[field] = {
      ...this._card[field],
      ...obj,
    };
  }
}
