import { Howl } from 'howler';
import { template } from './template';
import { PopupComponent } from '../../../../../common/popups/PopupManager';

export class AudioSplashPopup extends PopupComponent<any> {
  private _sound: Howl;
  private _onclick: VoidFunction;

  public clickHandler(): void {
    this._sound = new Howl({
      src: 'assets/sounds/blank.mp3',
      loop: false,
      html5: true,
    });

    this._sound.play();
    this._onclick && this._onclick();
    this.close();
  }

  public view({ attrs }) {
    this._onclick = attrs.onclick;
    return template.call(this);
  }

  public onremove() {
    this._sound.stop();
    this._sound = null;
  }
}
