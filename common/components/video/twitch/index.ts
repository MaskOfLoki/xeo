import { IVideoPlayerAttrs, IVideoPlayer } from '../IVideoPlayer';
import { ClassComponent, VnodeDOM, redraw, Vnode } from 'mithril';
import { template } from './template';
import { loading } from '../../../loading';
import { loadScript, delay } from '../../../utils';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

declare const Twitch;

export class TwitchPlayer implements ClassComponent<IVideoPlayerAttrs>, IVideoPlayer {
  private _element: HTMLElement;
  private _player;
  private _muted = true;
  private _autoplay = true;
  private _ontoggleplay: (value: boolean) => void;
  private _onduration: (value: number) => void;
  private _duration: number;
  private _paused: boolean;
  private _loop: boolean;
  private _isLive: boolean;
  private _lastSeek = 0;
  private _seekDelay = 5000;
  private _canSeek = true;

  public oninit(vnode: Vnode<IVideoPlayerAttrs>) {
    this._muted = !!vnode.attrs.muted;
  }

  public async oncreate(vnode: VnodeDOM<IVideoPlayerAttrs>) {
    this._element = vnode.dom as HTMLElement;
    await loading.wrap(this.initTwitchAPI());
    const [, channel, video] = new URL(vnode.attrs.src).pathname.split('/');
    this._autoplay = !!vnode.attrs.autoplay;

    const settings: any = {
      width: this._element.offsetWidth,
      height: `100%`,
      controls: false,
      autoplay: this._autoplay,
      muted: this._muted,
    };

    this._paused = !this._autoplay;
    this._isLive = !isEmptyString(channel) && channel !== 'videos';

    if (this._isLive) {
      settings.channel = channel;
    }

    if (!isEmptyString(video)) {
      settings.video = video;
    }

    this._player = new Twitch.Player(this._element, settings);
    this._player.addEventListener(Twitch.Player.READY, () => {
      this.checkDuration();

      if (vnode.attrs.ref) {
        vnode.attrs.ref(this);
      }

      redraw();
    });

    this._player.addEventListener(Twitch.Player.PLAY, this.playHandler.bind(this));
    this._player.addEventListener(Twitch.Player.PAUSE, this.pauseHandler.bind(this));
    this._player.addEventListener(Twitch.Player.ENDED, this.endedHandler.bind(this));
  }

  private playHandler() {
    this._ontoggleplay && this._ontoggleplay(true);
  }

  private pauseHandler() {
    this._ontoggleplay && this._ontoggleplay(false);
  }

  private endedHandler() {
    if (this._loop) {
      this._player.pause();
      this._player.seek(0);
    }
  }

  private async initTwitchAPI() {
    if (typeof Twitch !== 'undefined') {
      return;
    }

    return loadScript('https://player.twitch.tv/js/embed/v1.js');
  }

  private checkDuration() {
    if (this._duration === this.duration) {
      return;
    }

    this._duration = this.duration;

    if (this._onduration) {
      this._onduration(this._duration);
    }
  }

  public dispose(): void {
    this.pause();
  }

  public play(): void {
    if (!this._paused) {
      return;
    }

    this._player.play();
    this._paused = false;
  }

  public pause(): void {
    if (this._paused) {
      return;
    }

    this._player.pause();
    this._paused = true;
  }

  public seek(milliseconds: number) {
    // player hasn't updated it's state according to last seek call
    // to avoid video hang on android we're waiting for actual player position to change
    if (this._lastSeek > 0 && this.position === 0) {
      return;
    }

    if (
      this._canSeek &&
      !this._isLive &&
      milliseconds < this.duration &&
      Math.abs(this.position - milliseconds) > this._seekDelay
    ) {
      this._player.seek(Math.round(milliseconds * 0.001));
      this._lastSeek = milliseconds;
      this._canSeek = false;
      const now = Date.now();
      const lastPosition = this.position;

      // calculating seek delay to avoid infinite seek for slow connections
      const handler = async () => {
        this._player.removeEventListener(Twitch.Player.PLAYING, handler);

        // twitch doesn't update player's position right away, so we need to wait till it synced with actual seek value
        while (Math.abs(lastPosition - this.position) < Math.abs(lastPosition - milliseconds)) {
          await delay(1000);
        }

        this._seekDelay = Date.now() - now + 5000;
        this._canSeek = true;
      };

      this._player.addEventListener(Twitch.Player.PLAYING, handler);
    }
  }

  public view(vnode) {
    this._ontoggleplay = vnode.attrs.ontoggleplay;
    this._onduration = vnode.attrs.onduration;
    return template.call(this, vnode.attrs);
  }

  public get muted(): boolean {
    return this._muted;
  }

  public set muted(value: boolean) {
    if (this._muted === value) {
      return;
    }

    this._muted = value;
    this._player?.setMuted(value);
    this._player?.setVolume(value ? 0 : 1);
  }

  public set autoplay(value: boolean) {
    if (this._autoplay === value) {
      return;
    }

    this._autoplay = value;
  }

  public get autoplay(): boolean {
    return this._autoplay;
  }

  public get paused(): boolean {
    return (this._paused === undefined && this._player?.isPaused()) || this._paused;
  }

  public get duration(): number {
    return this._player.getDuration() * 1000;
  }

  public get position(): number {
    return this._player.getCurrentTime() * 1000;
  }
}
