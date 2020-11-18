import './module.scss';
import { template } from './template';
import { templateNew } from './template-new';
import { Vnode } from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { BaseEdit } from './base';
import { IPopupAttrs, PopupComponent } from '../../../../../../common/popups/PopupManager';
import { ICard, IChannel, CardStopMode, CardType, ITargetCard } from '../../../../../../common/common';
import { ICardTypeData, CardTypeDataFactory } from '../../../utils/CardTypeDataFactory';
import { MobilePreview } from '../../mobile-preview';
import { Card } from '../../card';

export interface IEditCardAttrs extends IPopupAttrs {
  card: ICard;
  channel: IChannel;
  disabledStopSettings?: boolean;
}

export class EditCardPopup extends PopupComponent<IEditCardAttrs> {
  private _card: ICard;
  private _channel: IChannel;
  private _isEnableChangeMode: boolean;
  private _typeData: ICardTypeData;
  private _preview: MobilePreview;

  public editComponent: BaseEdit;

  public oninit(vnode: Vnode<IEditCardAttrs>) {
    super.oninit(vnode);
    this._card = vnode.attrs.card;
    this._channel = vnode.attrs.channel;
    this._isEnableChangeMode = this._card.name === '';
    this._typeData = CardTypeDataFactory.get(this._card.type);
  }

  public previewLoadedHandler(value: MobilePreview) {
    //console.log("previewhandler");
    //console.log("stopTimer"+this._card.stopTimer);
    //console.log(this._card)
    this._preview = value;
    this._preview.updateCard(this._card);
  }

  public cardChangeHandler() {
    if (this._preview) {
      this._preview.updateCard(this._card);
    }
  }

  public buttonSaveHandler() {
    this._card.name = this._card.name.trim();

    if (isEmptyString(this._card.name)) {
      Swal.fire({
        icon: 'warning',
        title: 'Please, provide a card name',
      });
      return;
    }

    if (this._channel.cards.find((item) => item.name === this._card.name && item.id !== this._card.id)) {
      Swal.fire(`Card "${this._card.name}" already exists`, '', 'warning');
      return;
    }

    if (!this._card.stopMode && this._card.stopTimer <= 0) {
      Swal.fire(`Please provide timer value for the Auto mode`, '', 'warning');
      return;
    }

    if (this.card.stopMode === CardStopMode.CENSUS && this._card.stopCensus <= 0) {
      Swal.fire(`Please provide census value for the Census mode`, '', 'warning');
      return;
    }

    if (this.editComponent && !this.editComponent.validate()) {
      return;
    }

    if (!this._card.stopMode) {
      this._card.stopCensus = null;
    }

    if (this._card.stopMode === CardStopMode.CENSUS) {
      this._card.stopTimer = null;
    }

    if (this._card.type === CardType.TARGET) {
      const temp = this._card as ITargetCard;
      temp.entries.forEach((entry) => {
        entry.card.stopMode = temp.stopMode;
        entry.card.stopTimer = temp.stopTimer;
        entry.card.stopCensus = temp.stopCensus;
      });
    }

    this.close(this._card);
  }

  public changeModeHandler(type: CardType) {
    this._card.type = type;
    delete this._card['question'];
    delete this._card['answers'];
    this._typeData = CardTypeDataFactory.get(this._card.type);
    setTimeout(this.cardChangeHandler.bind(this), 100);
  }

  public view({ attrs }: Vnode<IEditCardAttrs>) {
    switch (attrs.card.type) {
      case CardType.BROWSER:
      case CardType.REACTION_THUMBS:
      case CardType.IMAGE:
        return templateNew.call(this, attrs);

      default:
        return template.call(this, attrs);
    }
  }

  public get card(): ICard {
    return this._card;
  }

  public get isEnableChangeMode(): boolean {
    return this._isEnableChangeMode;
  }

  public get typeData(): ICardTypeData {
    return this._typeData;
  }
}
