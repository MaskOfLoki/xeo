import m, { ClassComponent } from 'mithril';

import { FileVideoPlayer } from './file';
import { getFileExtension, parseVideoURL, isRTMPStream } from '../../../common/utils';
import { VimeoPlayer } from './vimeo';
import { YoutubePlayer } from './youtube';
import { EmbeddedVideo } from '../../types/EmbeddedVideo';
import { TwitchPlayer } from './twitch';
import { IRTMPStream } from '../../common';
import { WowzaPlayer } from './wowza';
import { isIOS } from '@gamechangerinteractive/xc-backend/utils';
import { IVideoPlayer } from './IVideoPlayer';

export class Video implements ClassComponent {
  private _src: string;
  private _component;
  private _visibilityChangeHandler: VoidFunction = this.visibilityChangeHandler.bind(this);
  private _needPlay: boolean;
  private _player: IVideoPlayer;

  constructor() {
    if (isIOS()) {
      document.addEventListener('visibilitychange', this._visibilityChangeHandler);
    }
  }

  private visibilityChangeHandler() {
    if (document.hidden) {
      // iOS autopause all videos on minimize, so we explicitly call pause method to make sure player internal state updated properly
      if (!this._player.paused || this._player.autoplay) {
        this._player.pause();
        this._needPlay = true;
      }
    } else if (this._needPlay) {
      setTimeout(() => this._player.play(), 100);
      this._needPlay = false;
    }
  }

  public onremove() {
    window.removeEventListener('visibilitychange', this._visibilityChangeHandler);
  }

  public view({ attrs }) {
    const cls = attrs.class;
    delete attrs.class;
    const playerAttrs = { ...attrs };
    playerAttrs.ref = (value) => {
      this._player = value;
      attrs.ref && attrs.ref(value);
    };

    if (this._src !== attrs.src) {
      let isSameStream = false;
      const src: any = this._src;
      if (typeof src == 'object' && typeof attrs.src == 'object') {
        if (src.id == attrs.src.id) {
          isSameStream = true;
        }
      }

      if (!isSameStream) {
        this._src = attrs.src;
        if (this._player?.dispose) {
          this._player.dispose();
        }
        const videoPlayer = attrs.src ? getVideoPlayer(attrs.src) : null;
        this._component = videoPlayer ? m(videoPlayer, playerAttrs) : null;
      }
    }

    return <div class={cls}>{this._component}</div>;
  }
}

function getVideoPlayer(url: string | IRTMPStream) {
  if (isRTMPStream(url)) {
    return WowzaPlayer;
  } else if (getFileExtension(url as string).toLowerCase() === 'mp4') {
    return FileVideoPlayer;
  } else {
    const { type } = parseVideoURL(url as string);
    switch (type) {
      case EmbeddedVideo.YouTube:
        return YoutubePlayer;
      case EmbeddedVideo.Vimeo:
        return VimeoPlayer;
      case EmbeddedVideo.Twitch:
        return TwitchPlayer;
    }
  }
}
