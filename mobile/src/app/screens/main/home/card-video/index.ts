import { IVideoCard, IRTMPStream } from '../../../../../../../common/common';
import { CardBaseScreen } from '../card-base';
import { api } from '../../../../services/api';
import { IVideoPlayer } from '../../../../../../../common/components/video/IVideoPlayer';
import { redraw } from 'mithril';
import { template } from './template';
import { isPreview } from '../../../../../../../common/utils/query';
import { isRTMPStream } from '../../../../../../../common/utils';
import { liveCard } from '../../../../services/live-card';
import { config } from '../../../../services/ConfigService';
import { isIOS } from '@gamechangerinteractive/xc-backend/utils';

export class CardVideoScreen extends CardBaseScreen {
  private _videoPlayer: IVideoPlayer;
  private _isPaused: boolean;
  private _manuallyPaused: boolean;
  private _initialAutoStart: boolean;
  private _playedButtonClicked: boolean;

  constructor() {
    super();
    this._subscriptions.push(liveCard.position.subscribe(this.liveCardPositionHandler.bind(this)));
    //this._playedButtonClicked = false;
    this._initialAutoStart = true;
    this._playedButtonClicked = true;
    this._isPaused = false;
  }

  private liveCardPositionHandler() {
    if (!this._videoPlayer) {
      return;
    }

    if (liveCard.paused && !this._videoPlayer.paused) {
      this._videoPlayer.pause();
    } else if (!liveCard.paused && this._videoPlayer.paused && !this._manuallyPaused) {
      if (this._initialAutoStart) {
        this._videoPlayer.muted = true;
        this._initialAutoStart = false;
      }

      this._videoPlayer.play();
    }
  }

  public setVideoPlayer(value: IVideoPlayer) {
    this._videoPlayer = value;
    this.invalidate();
  }

  public newCardHandler() {
    this._initialAutoStart = this.card.autoStart;
    this.card.autoStart = !liveCard.paused && this._initialAutoStart;
    this._isPaused = !this.card.autoStart;
    api.submitCardView(this.card);
    this.invalidate();
  }

  private invalidate() {
    if (!this.card || !this._videoPlayer) {
      return;
    }

    this._videoPlayer.muted = isIOS() || !config.audioSplash.enabled || isPreview();
    this._videoPlayer.autoplay = !!this.card.autoStart;

    if (!this.card.autoStart) {
      this._videoPlayer.pause();
    }

    redraw();
  }

  public async buttonShareHandler() {
    try {
      const url: string = isRTMPStream(this.card.video)
        ? (this.card.video as IRTMPStream).streamUrl
        : (this.card.video as string);
      await navigator['share']({
        title: 'XEO',
        text: this.card.message,
        url,
      });
      api.awardSocialSharing(this.card);
    } catch (e) {
      // sharing was cancelled
    }
  }

  public buttonPlayHandler() {
    this._initialAutoStart = false;

    if (this.isPaused) {
      if (!this._playedButtonClicked) {
        setTimeout(() => {
          this._videoPlayer.play();
        }, 100);
        this._playedButtonClicked = true;
      }

      this._manuallyPaused = false;
      this._videoPlayer.play();
      api.writeAction(this._card.id, 'played');
    } else {
      this._manuallyPaused = true;
      this._videoPlayer.pause();
      api.writeAction(this._card.id, 'paused');
    }
  }

  public buttonMuteHandler() {
    this._initialAutoStart = false;
    this._videoPlayer.muted = !this.isMuted;
    api.writeAction(this._card.id, 'muted', this._videoPlayer.muted);
  }

  public togglePlayHandler(playing: boolean) {
    this._isPaused = !playing;
    redraw();
  }

  public view() {
    return template.call(this);
  }

  public get card(): IVideoCard {
    return this._card as IVideoCard;
  }

  public get isPaused(): boolean {
    return this._isPaused === true || this._videoPlayer ? this._videoPlayer.paused : !this.card.autoStart;
  }

  public get isMuted(): boolean {
    return this._videoPlayer?.muted;
  }

  public get isReady(): boolean {
    return !!this._videoPlayer;
  }
}
