import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';
import { ICard, IImageObject } from '../../../../../../../../common/common';
import { IRadioOption } from '../../../../../components-next/radio-group';

export interface IMarketingMessagesTabAttrs {
  card: ICard;
}

export class MarketingMessagesTab implements ClassComponent<IMarketingMessagesTabAttrs> {
  public readonly typeOptions: IRadioOption[] = [
    { label: 'Image', value: 'image' },
    { label: 'Text', value: 'text' },
  ];
  private _card: ICard;

  public oninit({ attrs }: Vnode<IMarketingMessagesTabAttrs>) {
    this._card = attrs.card;
  }

  public view(vnode: Vnode<IMarketingMessagesTabAttrs>) {
    return template.call(this, vnode.attrs);
  }

  public setData(field: string, val: any) {
    if (!this._card.marketingMessage) {
      this._card.marketingMessage = {};
    }

    this._card.marketingMessage[field] = val;
  }
}
