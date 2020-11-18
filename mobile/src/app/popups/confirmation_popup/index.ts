import { PopupComponent, PopupManager } from '../../../../../common/popups/PopupManager';
import { Vnode } from 'mithril';
import { template } from './template';

export class ConfirmationPopup extends PopupComponent<any> {
  public static async show(message: string): Promise<boolean> {
    return await PopupManager.show(this, { message });
  }

  public onSelection(result: boolean) {
    this.close(result);
  }

  public view({ attrs }: Vnode) {
    return template.call(this, attrs);
  }
}
