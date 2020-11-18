import { redraw, Vnode } from 'mithril';
import { template } from './template';
import { api } from '../../../../../services/api';
import { IPopupAttrs, PopupComponent } from '../../../../../../../../common/popups/PopupManager';

export interface ISmsFeedbackAttrs extends IPopupAttrs<number> {
  total: number;
  queueId: number;
}

export class SmsFeedback extends PopupComponent<ISmsFeedbackAttrs, number> {
  protected sentCount = 0;
  private _timer: number;

  public view({ attrs }: Vnode) {
    return template.call(this, attrs);
  }

  public oninit(vnode: Vnode<ISmsFeedbackAttrs>) {
    super.oninit(vnode);

    this._timer = window.setInterval(async () => {
      const count = await api.getSmsSentCount(vnode.attrs.queueId);
      if (count !== this.sentCount) {
        this.sentCount = count < 0 ? vnode.attrs.total : count;
        redraw();
      }
      if (this.sentCount === vnode.attrs.total) {
        clearInterval(this._timer);
      }
    }, 300);
  }
}
