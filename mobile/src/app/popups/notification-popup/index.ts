import { IPopupAttrs, PopupComponent } from '../../../../../common/popups/PopupManager';
import { Vnode } from 'mithril';
import { template } from './template';

export interface INotificationAttrs extends IPopupAttrs {
  messageLines: string[];
}

export class NotificationPopup extends PopupComponent<INotificationAttrs> {
  public view({ attrs }: Vnode<IPopupAttrs>) {
    return template.call(this, attrs);
  }
}
