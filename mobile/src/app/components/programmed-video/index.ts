import { ClassComponent, redraw } from 'mithril';
import { template } from './template';
import { Unsubscribable } from 'rxjs';
import { api } from '../../services/api';
import { IState, IChannel, IRTMPStream } from '../../../../../common/common';
import { isEmptyString, isIOS } from '@gamechangerinteractive/xc-backend/utils';
import { IVideoPlayer } from '../../../../../common/components/video/IVideoPlayer';
import { liveCard } from '../../services/live-card';
import { isRTMPStream } from '../../../../../common/utils';
import { config } from '../../services/ConfigService';
import { PopupManager } from '../../../../../common/popups/PopupManager';
import { AudioSplashPopup } from '../../popups/audio-splash';

export class ProgrammedVideo implements ClassComponent {
  private readonly _subscriptions: Unsubscribable[] = [];
  private _videoPlayer: IVideoPlayer;
  private _channel: IChannel;
  private _destroyed: boolean;
  private _muted: boolean;

  public url: string | IRTMPStream;
  public synced: boolean;

  constructor() {
    this._subscriptions = [api.state.subscribe(this.stateHandler.bind(this))];
  }

  private stateHandler(value: IState) {
    if (
      isEmptyString(value.sid) ||
      (!isRTMPStream(value?.channel?.media) && isEmptyString(value?.channel?.media as string))
    ) {
      return;
    }

    this._channel = value.channel;
    this.url = value.channel.media;
    this.synced = value.channel.synced;

    if (this._videoPlayer) {
      if (this._channel.showMedia) {
        this._videoPlayer.muted = this._muted;
      } else {
        this._videoPlayer.muted = true;
      }
    }
  }

  public videoPlayerReadyHandler(value: IVideoPlayer) {
    this._videoPlayer = value;

    if (isIOS() && config.audioSplash.enabled) {
      this.iosWorkaround();
    } else {
      this._videoPlayer.muted = !config.audioSplash.enabled;
      this._muted = !config.audioSplash.enabled;
    }

    this._subscriptions.push(liveCard.position.subscribe(this.positionHandler.bind(this)));
  }

  private iosWorkaround() {
    PopupManager.show(AudioSplashPopup, {
      onclick: () => !this._destroyed && this._videoPlayer.play(),
    });
  }

  public togglePlayHandler(value: boolean) {
    if (value && liveCard.paused) {
      this._videoPlayer.pause();
    }

    redraw();
  }

  private positionHandler(value: number) {
    if (!this._videoPlayer) {
      return;
    }

    if (liveCard.paused && !this._videoPlayer.paused) {
      this._videoPlayer.pause();
    } else if (
      this._videoPlayer.paused &&
      !liveCard.paused &&
      (this._videoPlayer.duration === 0 || this._videoPlayer.duration > value)
    ) {
      this._videoPlayer.play();
    }

    // for live streams duration = 0
    if (this._videoPlayer.duration > 0 && this._videoPlayer.duration <= value) {
      this._videoPlayer.seek(this._videoPlayer.duration);
      this._videoPlayer.pause();
    } else if (Math.abs(this._videoPlayer.position - value) > 1000) {
      // Seek just beyond end of video to prevent flashing screen
      this._videoPlayer.seek(value + 1);
    }
  }

  public pauseHandler() {
    if (this._videoPlayer) {
      this._videoPlayer.pause();
    }

    liveCard.pause();
  }

  public buttonSoundHandler() {
    this._muted = !this.muted;
    this._videoPlayer.muted = this._muted;
  }

  public onremove() {
    this._destroyed = true;
    this._subscriptions.forEach((item) => item.unsubscribe());
  }

  public view(vnode) {
    return template.call(this, vnode.attrs);
  }

  public get paused(): boolean {
    return this._videoPlayer?.paused;
  }

  public get muted(): boolean {
    return this._videoPlayer?.muted;
  }

  public get channel(): IChannel {
    return this._channel;
  }
}
