import { redraw, route, VnodeDOM } from 'mithril';
import Swiper from 'swiper';

import { ClassBaseComponent } from '../../../../components/class-base';
import { api } from '../../../../services/api';
import { range } from '../../../../utils';

import { template } from './template';
import styles from './module.scss';
import 'swiper/css/swiper.min.css';
import { config } from '../../../../services/ConfigService';

export class AvatarSelectScreen extends ClassBaseComponent {
  private _swiper: Swiper;
  private _size: number;
  private _swiperElement: HTMLElement;
  private _resizeHandler: VoidFunction;

  public useCustomAvatars = false;
  public customAvatars = [];
  public avatarSlides = [range(0, 9)];
  public selected: number;
  public selectedUrl: string;

  public oncreate(vnode: VnodeDOM) {
    super.oncreate(vnode);
    this.resizeHandler();
    window.addEventListener('resize', (this._resizeHandler = this.resizeHandler.bind(this)));

    if (config.signup?.activeIconSet && config.signup?.activeIconSet !== 'default') {
      this.useCustomAvatars = true;
      const customAvatars = config.signup?.iconSets.find((set) => set.id === config.signup?.activeIconSet).icons;
      this.customAvatars = [];
      for (let i = 0; i < customAvatars.length; i += 25) {
        const avatars = [];
        for (let j = i; j < Math.min(i + 25, customAvatars.length); j++) {
          avatars.push(customAvatars[j]);
        }
        this.customAvatars.push(avatars);
      }
    }
  }

  public async buttonChooseHandler() {
    if (!this.useCustomAvatars) {
      await api.updateUser({ avatar: this.selected, avatarUrl: null });
    } else {
      await api.updateUser({ avatar: null, avatarUrl: this.selectedUrl });
    }

    if (route.get().includes('profile')) {
      route.set('/profile/edit');
    }
  }

  public view() {
    return template.call(this);
  }

  private resizeHandler() {
    if (this._swiper) {
      this._swiper.destroy(true, true);
    }

    window.setTimeout(() => this.updateSwiper(), 1000);
  }

  public updateSwiper() {
    this._swiperElement = this._element.querySelector(`.${styles.groupSwiper}`);
    this._swiper = new Swiper(this._swiperElement, {
      direction: 'horizontal',
      loop: false,
    });

    const w = this._swiperElement.offsetWidth;
    const h = this._swiperElement.offsetHeight;

    const sizeW = Math.floor(w * 0.24);
    const sizeH = Math.floor(h * 0.24);
    this._size = Math.min(sizeW, sizeH);
    redraw();
  }

  public onremove() {
    super.onremove();
    window.removeEventListener('resize', this._resizeHandler);
  }

  public get size(): number {
    return this._size;
  }
}
