import m, { Component, Vnode } from 'mithril';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import styles from './styles.module.scss';

export class PopupManager {
  public static show<T>(componentClass: any, attrs: any = {}): Promise<T> {
    return new Promise<any>((resolve) => {
      const overlay = document.createElement('div');
      overlay.classList.add(styles.popupOverlay);

      if (!attrs.closePopup) {
        attrs.closePopup = new Subject();
      }

      attrs.closePopup.pipe(first()).subscribe((value) => {
        overlay.style.animationName = styles.tweenHide;
        overlay.addEventListener('animationend', () => {
          overlay.remove();
          resolve(value);
          m.redraw();
        });
      });

      document.body.appendChild(overlay);
      m.mount(overlay, { view: () => m(componentClass, attrs) });
    });
  }
}

export interface IPopupAttrs<T = {}> {
  closePopup?: Subject<T>;
}

export abstract class PopupComponent<T extends IPopupAttrs<S>, S = {}> implements Component<T> {
  private _closePopup: Subject<S>;

  public oninit(vnode: Vnode<T>) {
    this._closePopup = vnode.attrs.closePopup;
  }

  protected close(result?: S) {
    this._closePopup.next(result);
  }

  public abstract view(vnode?: Vnode<T>);
}
