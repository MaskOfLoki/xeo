import { ISounderCard } from '../../../../../../../common/common';
import { CardBaseScreen } from '../card-base';
import { api } from '../../../../services/api';
import { Howl } from 'howler';
import { VnodeDOM } from 'mithril';
import { redraw } from 'mithril';

import { template } from './template';
import styles from './module.scss';
import { randNumber, isIOS } from '@gamechangerinteractive/xc-backend/utils';
import { micService } from '../../../../services/MicService';
import { swalAlert } from '../../../../utils';

const SOUNDERBAR_MAX_TAPS_PER_MIN = 150;
const MIC_THRESHOLD_VALUE = 3;

export class CardSounderScreen extends CardBaseScreen {
  private _tapData: { [index: number]: number } = {};
  private _timerSubmit: number;
  private _timerStopSound: number;
  private _isFirstSubmit = true;
  private _soundIndex: number;
  private _sound: Howl;
  private _totalTaps: number;
  private _totalSeconds: number;
  private _timerID: number;
  private _isMicMode: boolean;
  private _micValue = 0;
  private _playing: number;
  private _soundIconThrottle = false;
  private _callback;

  constructor() {
    super();
    this._totalTaps = 0;
    this._totalSeconds = 0;
    this._isMicMode = false;
  }

  public newCardHandler() {
    this._isFirstSubmit = true;

    if (this._isMicMode) {
      this.toggleMicMode();
    }
  }

  public async toggleMicMode() {
    this._isMicMode = !this._isMicMode;

    if (this._isMicMode) {
      try {
        await micService.start();
        micService.subscribe(this.micHander.bind(this));
      } catch (e) {
        swalAlert({
          title: `Sorry, the feature isn't yet available for your device`,
        });
        this._isMicMode = false;
        redraw();
      }
    } else {
      micService.stop();
    }
  }

  public micHander(value: number) {
    let noiseSoundIndex = this.card.sounds.findIndex((sound) => sound.name == 'Make Some Noise');

    let noiseSoundImage = '';
    if (noiseSoundIndex === -1) {
      noiseSoundIndex = 0;
      noiseSoundImage = 'assets/images/icons/microphone.svg';
    } else {
      noiseSoundImage = this.card.sounds[noiseSoundIndex].image;
    }

    this._micValue = value;

    if (value > MIC_THRESHOLD_VALUE) {
      this.generateSounderIcon(noiseSoundImage);
      this.startCircularAnimation();

      this._totalTaps++;

      if (this._tapData[noiseSoundIndex]) {
        this._tapData[noiseSoundIndex]++;
      } else {
        this._tapData[noiseSoundIndex] = 1;
      }

      this.debouncedSubmit();
    }
  }

  public oncreate(vnode: VnodeDOM) {
    super.oncreate(vnode);
    this._timerID = window.setInterval(() => {
      this._totalSeconds++;
      redraw();
    }, 1000);
  }

  public view() {
    return template.call(this);
  }

  public generateSounderIcon(url) {
    if (isIOS()) {
      if (this._soundIconThrottle) {
        return;
      }
      this._soundIconThrottle = true;
      setTimeout(this.clearSoundIconThrottle.bind(this), 400);
    }

    const boundingRect = this._element.getBoundingClientRect();
    const width = boundingRect.right - boundingRect.left;
    const left = randNumber(boundingRect.right - width / 4, boundingRect.right - width / 10);
    const top = randNumber(
      boundingRect.height - boundingRect.height / 4,
      boundingRect.height - boundingRect.height / 10,
    );

    const el = document.createElement('div');

    el.classList.add(styles.sounderIcon);
    el.style.maskImage = `url(${url})`;
    el.style.webkitMaskImage = `url(${url})`;
    el.style.backgroundColor = this.card.colors.icon;
    el.style.left = left + 'px';
    el.style.top = top + 'px';

    el.onanimationend = () => {
      el.remove();
      el.onanimationend = undefined;
    };

    this._element.appendChild(el);
  }

  public buttonHandler(index: number) {
    this.generateSounderIcon(this.card.sounds[index].image);

    this._totalTaps++;
    if (this._tapData[index]) {
      this._tapData[index]++;
    } else {
      this._tapData[index] = 1;
    }

    this.debouncedSubmit();
    this.playSound(index);
  }

  private clearSoundIconThrottle(): void {
    this._soundIconThrottle = false;
  }

  private debouncedSubmit() {
    if (this._timerSubmit) {
      return;
    }

    this._timerSubmit = window.setTimeout(this.submit.bind(this), 1000);
  }

  private submit() {
    api.submitSounderCardValue(this.card, this._tapData, this._isFirstSubmit);
    api.writeAction(this._card.id, 'sounder_data', {
      firstSubmit: this._isFirstSubmit,
      tapData: this._tapData,
    });
    this._isFirstSubmit = false;
    this._tapData = {};
    this._timerSubmit = undefined;
  }

  private playSound(index: number) {
    if (this.card.muteMobile) {
      return;
    }

    clearTimeout(this._timerStopSound);
    this._timerStopSound = window.setTimeout(this.stopSound.bind(this), 1000);

    if (this._soundIndex == index) {
      return;
    }

    this.stopSound();
    this._soundIndex = index;
    this._sound = new Howl({
      src: this.card.sounds[index].url,
      loop: false,
      html5: true,
    });

    this._callback = (id) => {
      this._sound.play();
    };

    this._sound.on('end', this._callback);

    this._playing = this._sound.play();
  }

  private stopSound() {
    if (!this._sound) {
      return;
    }

    this._sound.off('end', this._callback);

    this._soundIndex = undefined;

    if (this._playing !== undefined) {
      this._sound.stop(this._playing);
    } else {
      this._sound.stop();
    }
    this._sound = undefined;
    this._playing = undefined;
  }

  public onremove() {
    super.onremove();
    this.stopSound();
    micService.stop();
    window.clearInterval(this._timerID);
  }

  public get card(): ISounderCard {
    return this._card as ISounderCard;
  }

  public get sounderbarPercent(): number {
    if (!this.isMicMode) {
      const sounderbarNo = Math.floor(
        (((this._totalTaps * 60) / (this._totalSeconds ? this._totalSeconds : 1)) * 100) / SOUNDERBAR_MAX_TAPS_PER_MIN,
      );

      return sounderbarNo > 100 ? 100 : sounderbarNo;
    } else {
      return Math.min(Math.max(this._micValue - MIC_THRESHOLD_VALUE, 0) / 3, 1) * 100;
    }
  }

  public get isMicMode(): boolean {
    return this._isMicMode;
  }

  private startCircularAnimation() {
    const progress = this._element.getElementsByClassName(styles.progressValue)[0] as HTMLElement;
    progress.onanimationend = (el: any) => {
      el.classList.remove(styles.active);
    };
    progress.classList.add(styles.active);
  }
}
