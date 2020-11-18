import { IVideoPlayerAttrs, IVideoPlayer } from '../IVideoPlayer';
import { ClassComponent, VnodeDOM, redraw } from 'mithril';
import { template } from './template';
import { loading } from '../../../loading';
import { loadScript, parseVideoURL } from '../../../utils';
import { isPreview } from '../../../utils/query';
import { ITimeService } from '../../../common';

declare const YT;

export class YoutubePlayer implements ClassComponent<IVideoPlayerAttrs>, IVideoPlayer {
  private static _promiseInitYTAPI: Promise<void>;

  private _element: HTMLElement;
  private _player;
  private _muted = true;
  private _autoplay = true;
  private _loop: boolean;
  private _duration = 0;
  private _ontoggleplay: (value: boolean) => void;
  private _onduration: (value: number) => void;
  private _videoId: string;
  private _playerState: number;
  private _needStop: boolean;
  private _isLive: boolean;
  private _liveStartTime: number;
  private _time: ITimeService;
  private _syncStatus = false;

  public async oncreate({ dom, attrs }: VnodeDOM<IVideoPlayerAttrs>) {
    this._element = dom as HTMLElement;
    this._time = attrs.time ?? {
      time() {
        return Date.now();
      },
    };

    await loading.wrap(YoutubePlayer.initYTAPI());
    const { id } = parseVideoURL(attrs.src);
    this._videoId = id;
    this._loop = attrs.loop;
    this._ontoggleplay = (attrs as any).ontoggleplay;
    this.createPlayer(attrs);
  }

  private createPlayer(attrs): void {
    if (YT.Player) {
      this._player = new YT.Player(this._element, {
        width: this._element.offsetWidth,
        videoId: this._videoId,
        playerVars: {
          autoplay: attrs.autoplay ? 1 : 0,
          controls: 0,
          playsinline: 1,
          modestbranding: 0,
          loop: attrs.loop ? 1 : 0,
          playlist: attrs.loop ? this._videoId : undefined,
          rel: 0,
        },
        events: {
          onReady: () => {
            // for live streams duration on onReady event is always 0, but it may change later
            // for usual videos duration on onReady event shows actual video duration
            // this is unofficial hook and may be changed by Youtube
            // TODO: research Youtube REST API for a way to detect for sure if it's live stream or video clip
            this._isLive = this.duration === 0;
            this.checkDuration();

            if (attrs.ref) {
              attrs.ref(this);
            }

            if (attrs.autoplay && this._autoplay) {
              if (attrs.muted) {
                this._player.mute();
              }
              this._player.playVideo();
            } else {
              // This is here to force a state change due to the player no longer passing an initial state
              this._needStop = true;
              this._player.playVideo();
            }

            this._muted = !!attrs.muted;

            if (isPreview()) {
              this._player.mute();
            }

            this.startSync(true);

            redraw();
          },
          onStateChange: this.stateChangeHandler.bind(this),
        },
      });
    } else {
      setTimeout(this.createPlayer.bind(this, attrs), 100);
    }
  }

  /**
   * Called on Player Stop Events (Paused, Ended)
   */
  private stopSync() {
    this._syncStatus = false;
  }

  private startSync(isStart = false) {
    this._syncStatus = true;
    if (isStart == true) {
      this.sync();
    }
  }

  private sync() {
    if (!this._syncStatus) {
      return;
    }
    if (Math.abs(this._time.time() - (this._liveStartTime + this.position)) > 3000) {
      this._player.seekTo(this._time.time() - this._liveStartTime);
    }
    setTimeout(this.sync.bind(this), 30000);
  }

  private checkDuration() {
    if (this._duration === this.duration) {
      return;
    }

    if (this._isLive && this.duration > 0 && !this._liveStartTime) {
      this._liveStartTime = this._time.time() - this.duration;
    }

    this._duration = this.duration;

    if (this._onduration) {
      this._onduration(this._duration);
    }
  }

  private stateChangeHandler(e) {
    this.checkDuration();
    this._playerState = e.data;

    switch (e.data) {
      case 0:
        if (!this._loop) {
          this._player.pauseVideo();
          this._player.seekTo(0, false);
          this.stopSync();
        }
        break;
      case 1:
        this.startSync();
        if (this._needStop) {
          this._needStop = false;
          this._player.stopVideo();
        } else {
          this._ontoggleplay && this._ontoggleplay(true);
        }
        break;
      case -1:
      case 2:
        this._ontoggleplay && this._ontoggleplay(false);
        this.stopSync();
        break;
    }

    redraw();
  }

  private static async initYTAPI() {
    if (typeof YT !== 'undefined') {
      return;
    } else if (this._promiseInitYTAPI) {
      return this._promiseInitYTAPI;
    }

    this._promiseInitYTAPI = new Promise((resolve, reject) => {
      window['onYouTubeIframeAPIReady'] = () => {
        delete window['onYouTubeIframeAPIReady'];
        resolve();
      };

      loadScript('https://www.youtube.com/iframe_api').catch(reject);
    });

    await this._promiseInitYTAPI;
    this._promiseInitYTAPI = undefined;
  }

  public dispose(): void {
    this.pause();
  }

  public play(): void {
    this._needStop = false;
    this._player.playVideo();
  }

  public pause(): void {
    this._player.pauseVideo();
  }

  public seek(milliseconds: number) {
    // TODO: implement proper position sync for live streams using liveStartTime
    if (!this._isLive) {
      this._player.seekTo(Math.round(milliseconds * 0.001));
    }
  }

  public onremove() {
    this._player && this._player.destroy();
  }

  public view(vnode) {
    this._onduration = vnode.attrs.onduration;

    const { id } = parseVideoURL(vnode.attrs.src);

    if (this._videoId !== id && this._player) {
      this._videoId = id;
      this._player.loadVideoById(id);
    }

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

    if (this._muted) {
      this._player?.mute();
    } else {
      this._player?.unMute();
    }

    this._player?.setVolume(value ? 0 : 100);
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
    return this._playerState === 2 || this._playerState === -1 || this._playerState === 5;
  }

  public get duration(): number {
    if (this._player) {
      return this._player.getDuration() * 1000;
    }
  }

  public get position(): number {
    if (this._player) {
      return this._player.getCurrentTime() * 1000;
    }
  }
}
