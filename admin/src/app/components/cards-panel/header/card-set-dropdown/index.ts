import { ClassComponent } from 'mithril';
import { template } from './template';
import { ICardSet, IChannel } from '../../../../../../../common/common';

export interface ICardSetDropdownAttrs {
  oncardsetadd: () => void;
  oncardsetedit: (set: ICardSet) => void;
  oncardsetdelete: (set: ICardSet) => void;
  oncardsetchange: (set: ICardSet) => void;
  activeCardSet: ICardSet;
  channel: IChannel;
}

export class CardSetDropdown implements ClassComponent<ICardSetDropdownAttrs> {
  public view({ attrs }) {
    return template.call(this, attrs);
  }
}
