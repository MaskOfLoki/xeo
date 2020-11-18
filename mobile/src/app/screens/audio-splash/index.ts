import { ClassComponent, route } from 'mithril';
import { Howl } from 'howler';
import { template } from './template';
import { initService } from '../../services/init';

export class AudioSplashScreen implements ClassComponent {
  private _sound: Howl;

  public clickHandler(): void {
    this._sound = new Howl({
      src: 'assets/sounds/blank.mp3',
      loop: false,
      html5: true,
    });

    this._sound.play();

    initService.start();
  }

  public view() {
    return template.call(this);
  }

  public onremove() {
    this._sound.stop();
    this._sound = null;
  }
}
