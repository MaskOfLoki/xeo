import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';
import { ITimeline, IChannel, IState } from '../../../../../../../common/common';
import { IVideoPlayer } from '../../../../../../../common/components/video/IVideoPlayer';
import { MobilePreview } from '../../../../components/mobile-preview';
import { api } from '../../../../services/api';
import { Unsubscribable } from 'rxjs';

export interface ITimelinePreviewsAttrs {
  channel: IChannel;
  onduration: (value: number) => void;
  ontoggleplay: (value: boolean) => void;
  ref: (value: TimelinePreviews) => void;
  onsave: (value: IChannel) => void;
}

export class TimelinePreviews implements ClassComponent<ITimelinePreviewsAttrs> {
  private _videoPlayer: IVideoPlayer;
  private _mobilePreview: MobilePreview;
  private _timeline: ITimeline;
  private _online: boolean;
  private _subscriptions: Unsubscribable[];
  private _isPlaying: boolean;
  private _seekPosition: number;

  public showMediaContent: boolean;
  private _channel: IChannel;
  private _onsave: (value: IChannel) => void;

  public oninit(vnode: Vnode<ITimelinePreviewsAttrs>) {
    this._subscriptions = [api.state(vnode.attrs.channel.id).subscribe(this.stateHandler.bind(this))];

    this._channel = vnode.attrs.channel;
    this.showMediaContent = this._channel.showMedia;
    this._onsave = vnode.attrs.onsave;
  }

  public showMediaChangeHandler(value: boolean) {
    this.showMediaContent = value;
    this._channel.showMedia = value;
    this._onsave(this._channel);
  }

  private stateHandler(state: IState) {
    if (this._online === state.channel?.online) {
      return;
    }

    this._online = state.channel?.online;

    if (!this._online) {
      this._videoPlayer.pause();
      this._videoPlayer.seek(0);
    }
  }

  public oncreate({ attrs }: Vnode<ITimelinePreviewsAttrs>) {
    attrs.ref(this);
  }

  public videoReadyPlayerHandler(value: IVideoPlayer) {
    this._videoPlayer = value;

    if (this._isPlaying) {
      this._videoPlayer.play();

      if (this._seekPosition) {
        this._videoPlayer.seek(this._seekPosition);
      }
    }
  }

  public onremove() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public seek(milliseconds: number) {
    this._seekPosition = milliseconds;
    this._videoPlayer && this._videoPlayer.seek(milliseconds);
    this._mobilePreview && this._mobilePreview.seekTimeline(this._timeline, milliseconds);
  }

  public mobilePreviewReadyHandler(value: MobilePreview) {
    this._mobilePreview = value;
    this._mobilePreview.pauseTimeline(this._timeline, 0);
  }

  public togglePlay(value: boolean) {
    this._isPlaying = value;

    if (value) {
      this._videoPlayer && this._videoPlayer.play();
      this._mobilePreview && this._mobilePreview.playTimeline(this._timeline);
    } else {
      this._videoPlayer && this._videoPlayer.pause();
      this._mobilePreview && this._mobilePreview.pauseTimeline(this._timeline, this._videoPlayer.position);
    }
  }

  public view({ attrs }: Vnode<ITimelinePreviewsAttrs>) {
    this._timeline = attrs.channel.timeline;
    return template.call(this, attrs);
  }
}
