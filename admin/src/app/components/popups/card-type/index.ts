import './module.scss';
import { template } from './template';
import { Vnode } from 'mithril';
import { IPopupAttrs, PopupComponent } from '../../../../../../common/popups/PopupManager';
import { CardType } from '../../../../../../common/common';
import { ICardTypeData, CardTypeDataFactory } from '../../../utils/CardTypeDataFactory';

interface ICardTypePopupAttrs extends IPopupAttrs {
  skip?: CardType[];
}

export class CardTypePopup extends PopupComponent<ICardTypePopupAttrs> {
  private _types: CardType[] = [
    CardType.REACTION_THUMBS,
    CardType.REACTION_APPLAUSE,
    CardType.REACTION_SLIDER,
    CardType.SOUNDER,
    CardType.TRIVIA,
    CardType.POLL,
    CardType.IMAGE,
    CardType.VIDEO,
    CardType.BROWSER,
    CardType.QB_TOSS,
    CardType.HAT_SHUFFLE,
    CardType.SKEEBALL,
    CardType.POP_A_SHOT,
    // CardType.TUG_OF_WAR,
    CardType.FAN_FILTER_CAM,
    CardType.TURBO_TRIVIA_2,
    CardType.TARGET,
  ];

  private _typeData: ICardTypeData[] = [];

  public oninit(vnode: Vnode<ICardTypePopupAttrs>) {
    super.oninit(vnode);
    const skip: CardType[] = vnode.attrs.skip ?? [];
    this._types = this._types.filter((item) => !skip.includes(item));
    this._typeData = this._types.map((item) => CardTypeDataFactory.get(item));
  }

  public buttonHandler(index: number) {
    this.close(this._types[index]);
  }

  public view() {
    return template.call(this);
  }

  public get typeData(): ICardTypeData[] {
    return this._typeData;
  }
}
