import { ClassComponent, Vnode } from 'mithril';
import { ICard } from '../../../../../../../common/common';
import { template } from './template';

export interface IStopSettingsNewAttrs {
  card: ICard;
}

export class StopSettingsNew implements ClassComponent<IStopSettingsNewAttrs> {
  public card: ICard;

  public oninit({ attrs }: Vnode<IStopSettingsNewAttrs>) {
    this.card = attrs.card;
  }

  public view({ attrs }: Vnode<IStopSettingsNewAttrs>) {
    return template.call(this, attrs);
  }
}
