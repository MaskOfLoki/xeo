import { ClassComponent } from 'mithril';
import { template } from './template';
import { ICardSet, IChannel } from '../../../../../../common/common';

export interface ICardsPanelHeaderAttrs {
  oncardadd: () => void;
  oncardsearch: () => void;
  oncardsetadd: () => void;
  oncardsetedit: (set: ICardSet) => void;
  oncardsetdelete: (set: ICardSet) => void;
  oncardsetchange: (set: ICardSet) => void;
  activeCardSet: ICardSet;
  channel: IChannel;
}

export class CardsPanelHeader implements ClassComponent<ICardsPanelHeaderAttrs> {
  public view({ attrs }) {
    return template.call(this, attrs);
  }
}
