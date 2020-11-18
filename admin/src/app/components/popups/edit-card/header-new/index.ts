import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';
import { ICardTypeData } from '../../../../utils/CardTypeDataFactory';
import { CardType, ICard } from '../../../../../../../common/common';

export interface IHeaderAttrs {
  card: ICard;
  onClose: () => void;
  onSave: () => void;
  typeData: ICardTypeData;
}

export class Header implements ClassComponent<IHeaderAttrs> {
  public name = '';
  public checked = false;
  public stopSettings = 'auto';
  public autoTimeout = 300000;
  public censusUserCount = 10000;
  public fullscreen = false;
  public splitScreen = false;

  public view({ attrs }: Vnode<IHeaderAttrs>) {
    return template.call(this, attrs);
  }

  public onNameChange(val: string) {
    this.name = val;
  }

  public onCheckboxChange(val: boolean) {
    this.checked = val;
  }

  public stopSettingsHandler(key: string, val: string | number) {
    switch (key) {
      case 'stopSettings':
        this.stopSettings = val.toString();
        break;
      case 'autoTimeout':
        this.autoTimeout = +val;
        break;
      case 'censusUserCount':
        this.censusUserCount = +val;
        break;
    }
  }
}
