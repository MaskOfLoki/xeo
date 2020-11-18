/**
 * Created by Nikolay Glushchenko (nick@nickalie.com) on 06.03.2018.
 */

import NProgress from 'nprogress';
import styles from './loading.module.scss';

class Index {
  private _count = 0;
  private _overlay: HTMLElement;
  private _disabled: boolean;

  public show(): void {
    if (this._count === 0 && !this._disabled) {
      NProgress.start();

      if (!this._overlay) {
        this._overlay = document.createElement('div');
        this._overlay.classList.add(styles.overlay);
        document.body.appendChild(this._overlay);
      }
    }

    this._count++;
  }

  public hide(): void {
    if (this._count === 0) {
      return;
    }

    this._count--;

    if (this._count === 0) {
      setTimeout(this.innerHide.bind(this), 100);
    }
  }

  public wrap<T>(promise: Promise<T>): Promise<T> {
    this.show();
    return promise.then(
      (result) => {
        this.hide();
        return result;
      },
      (error) => {
        this.hide();
        throw error;
      },
    );
  }

  public disable() {
    this._disabled = true;
  }

  private innerHide(): void {
    if (this._count === 0) {
      NProgress.done();

      if (this._overlay) {
        this._overlay.remove();
        this._overlay = null;
      }
    }
  }
}

export const loading: Index = new Index();
