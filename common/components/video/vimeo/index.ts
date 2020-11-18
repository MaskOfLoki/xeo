import { IVideoPlayerAttrs, IVideoPlayer } from '../IVideoPlayer';
import { ClassComponent, VnodeDOM, redraw, Vnode } from 'mithril';
import { template } from './template';
import { loading } from '../../../loading';

export class VimeoPlayer implements ClassComponent<IVideoPlayerAttrs>, IVideoPlayer {
  private _element: HTMLElement;
  private _player;
  private _muted = true;
  private _autoplay = true;
  private _loop: boolean;
  private _ontoggleplay: (value: boolean) => void;
  private _onduration: (value: number) => void;
  private _duration: number;
  private _position: number;

  public paused = true;

  public oninit(vnode: Vnode<IVideoPlayerAttrs>) {
    this._muted = !!vnode.attrs.muted;
  }

  public async oncreate({ dom, attrs }: VnodeDOM<IVideoPlayerAttrs>) {
    this._element = dom as HTMLElement;
    this._loop = attrs.loop;
    const module = await loading.wrap(import('@vimeo/player'));
    const Player = module.default;
    const height: number = this._element.offsetHeight || this._element.parentElement.offsetHeight;

    this._player = new Player(this._element, {
      url: attrs.src,
      controls: false,
      autoplay: !!attrs.autoplay,
      muted: !!attrs.autoplay || !!attrs.muted,
      loop: !!this._loop,
      width: this._element.offsetWidth,
      height,
      maxheight: height,
    });

    this.paused = !attrs.autoplay;
    this._player.on('play', this.playHandler.bind(this));
    this._player.on('pause', this.pauseHandler.bind(this));
    this._player.on('ended', this.endHandler.bind(this));
    this._player.on('timeupdate', this.timeUpdateHandler.bind(this));

    if (attrs.ref) {
      attrs.ref(this);
    }
  }

  private pauseHandler() {
    this.paused = true;
    this._ontoggleplay(false);
    this.checkDuration();
    redraw();
  }

  private endHandler() {
    if (!this._loop) {
      this._player.pause();
      this._player.setCurrentTime(0);
    }
  }

  private playHandler() {
    this.paused = false;
    this._ontoggleplay(true);
    this.checkDuration();
    redraw();
  }

  private timeUpdateHandler({ duration, seconds }) {
    this.updateDuration(duration);
    this._position = seconds * 1000;
  }

  private async checkDuration() {
    this.updateDuration(await this._player.getDuration());
  }

  private updateDuration(value: number): void {
    value *= 1000;

    if (this._duration !== value) {
      this._duration = value;
      this._onduration && this._onduration(value);
    }
  }

  public dispose(): void {
    this.pause();
  }

  public play(): void {
    this._player.play();
  }

  public pause(): void {
    this._player.pause();
  }

  public seek(milliseconds: number) {
    this._player.setCurrentTime(Math.round(milliseconds * 0.001));
  }

  public view(vnode) {
    this._ontoggleplay = vnode.attrs.ontoggleplay;
    this._onduration = vnode.attrs.onduration;
    return template.call(this, vnode.attrs);
  }

  public onremove() {
    if (!this._player) {
      return;
    }

    this._player.off('play');
    this._player.off('pause');
  }

  public get muted(): boolean {
    return this._muted;
  }

  public set muted(value: boolean) {
    if (this._muted === value) {
      return;
    }

    this._muted = value;

    if (this._player) {
      this._player.setVolume(value ? 0 : 1);
    } else {
      this._element.setAttribute('data-vimeo-muted', value.toString());
    }
  }

  public set autoplay(value: boolean) {
    if (this._autoplay === value) {
      return;
    }

    this._autoplay = value;
    this._element.setAttribute('data-vimeo-autoplay', value.toString());

    if (!value) {
      this.paused = true;
    }
  }

  public get autoplay(): boolean {
    return this._autoplay;
  }

  public get duration(): number {
    return this._duration;
  }

  public get position(): number {
    return this._position;
  }
}
