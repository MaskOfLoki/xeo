import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';
import { ICardTypeData } from '../../../../utils/CardTypeDataFactory';
import { CardType } from '../../../../../../../common/common';

export interface IHeaderAttrs {
  name: string;
  onInput: (e) => void;
  onClose: () => void;
  onSave: () => void;
  onChangeMode: (CardType) => void;
  typeData: ICardTypeData;
  isEnableChangeMode: boolean;
}

export class Header implements ClassComponent<IHeaderAttrs> {
  private _onChangeMode: (CardType) => void;
  private _typeData: ICardTypeData;

  public oninit(vnode: Vnode<IHeaderAttrs>) {
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate(vnode: Vnode<IHeaderAttrs>) {
    this._onChangeMode = vnode.attrs.onChangeMode;
    this._typeData = vnode.attrs.typeData;
  }

  public view({ attrs }: Vnode<IHeaderAttrs>) {
    return template.call(this, attrs);
  }

  public changeMode() {
    switch (this._typeData.type) {
      case CardType.POLL:
        this._onChangeMode(CardType.POLL_IMAGE);
        break;
      case CardType.POLL_IMAGE:
        this._onChangeMode(CardType.POLL);
        break;
      case CardType.TRIVIA:
        this._onChangeMode(CardType.TRIVIA_IMAGE);
        break;
      case CardType.TRIVIA_IMAGE:
        this._onChangeMode(CardType.TRIVIA);
        break;
    }
  }
}
