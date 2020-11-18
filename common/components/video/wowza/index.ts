import { loadScript, delay } from '../../../utils';
import { IRTMPStream, IWowzaService } from '../../../common';
import m, { ClassComponent } from 'mithril';
import { IVideoPlayerAttrs, IVideoPlayer } from '../IVideoPlayer';
import { loading } from '../../../loading';

declare const videojs;

export class WowzaPlayer implements ClassComponent<IVideoPlayerAttrs>, IVideoPlayer {
  private _player;
  private _wowza: IWowzaService;
  private _streamId: string;

  private _onduration: (value: number) => void;
  private _ontoggleplay: (value: boolean) => void;

  public async oncreate({ attrs, dom }) {
    this._wowza = attrs.wowza;

    if (!this._wowza) {
      console.warn('WowzaPlayer: wowza attribute is missing');
    }

    this._streamId = attrs.src.id;
    await loading.wrap(Promise.all([this.ensureStreamStarted(), this.initVideoJS()]));

    this._player = videojs(dom, {
      errorDisplay: false,
      autoplay: !!attrs.autoplay,
      muted: !!attrs.autoplay,
    });

    this._player.on('play', () => this._ontoggleplay && this._ontoggleplay(true));
    this._player.on('pause', () => this._ontoggleplay && this._ontoggleplay(false));

    attrs.ref && attrs.ref(this);
  }

  private async ensureStreamStarted() {
    let state: string = await this._wowza.getRTMPStreamState(this._streamId).catch((e) => {
      console.error('this._wowza.getRTMPStreamState line 43');
      throw e;
    });

    if (state === 'stopped') {
      await this._wowza.startRTMPStream(this._streamId).catch((e) => {
        console.error('this._wowza.startRTMPStream');
        throw e;
      });
    }

    let count = 0;

    while (state !== 'started' && count < 5) {
      await delay(2000);
      state = await this._wowza.getRTMPStreamState(this._streamId).catch((e) => {
        console.error('this._wowza.getRTMPStreamState line 59');
        throw e;
      });
      count++;
    }
  }

  private async initVideoJS() {
    const stylesId = 'videoJSStyles';

    if (typeof videojs !== 'undefined' || !!document.getElementById(stylesId)) {
      return;
    }

    const link = document.createElement('link');
    link.id = stylesId;
    link.rel = 'stylesheet';
    link.href = 'https://vjs.zencdn.net/7.8.4/video-js.css';
    document.head.appendChild(link);
    await loadScript('https://vjs.zencdn.net/7.8.4/video.js');
    await loadScript('https://unpkg.com/@videojs/http-streaming@1.13.3/dist/videojs-http-streaming.min.js');
  }

  public dispose(): void {
    this.pause();
    this._player.dispose();
  }

  public play(): void {
    this._player.play();
  }

  public pause(): void {
    this._player.pause();
  }

  public seek(milliseconds: number): void {
    this._player.currentTime(Math.round(milliseconds * 0.001));
  }

  public view({ attrs }) {
    attrs = { ...attrs };
    attrs.preload = '';
    attrs.playsinline = '';
    this._onduration = attrs.onduration;
    this._ontoggleplay = attrs.ontoggleplay;

    attrs.style = Object.assign(
      {
        width: '100%',
        maxHeight: '100%',
      },
      attrs.style ?? {},
    );

    const src: IRTMPStream = attrs.src;
    delete attrs.src;

    return m('video', attrs, [
      m('source', {
        src: src.streamUrl,
        type: 'application/x-mpegURL',
      }),
    ]);
  }

  public get duration(): number {
    return this._player.duration();
  }

  public get paused() {
    return this._player.paused();
  }

  public get position() {
    return this._player.currentTime();
  }

  public get muted(): boolean {
    return this._player.muted();
  }

  public set muted(value: boolean) {
    this._player.muted(value);
  }

  public get autoplay(): boolean {
    return this._player.autoplay();
  }

  public set autoplay(value: boolean) {
    this._player.autoplay(value);
  }
}
