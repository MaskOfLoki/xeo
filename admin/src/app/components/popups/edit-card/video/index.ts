import { template } from './template';
import { BaseEdit, IBaseEditAttrs } from '../base';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { Vnode } from 'mithril';
import { parseVideoURL, isRTMPStream } from '../../../../../../../common/utils';
import { STREAM_PLATFORMS, STREAM_PLATFORMS_NAMES } from '../../../../../../../common/types/EmbeddedVideo';
import { IVideoCard, IRTMPStream } from '../../../../../../../common/common';
import { api } from '../../../../services/api';

export class EditVideo extends BaseEdit {
  public isStream: boolean;
  public isRTMP: boolean;
  public streamUrl = '';
  public streams: IRTMPStream[] = [];

  public async oninit(vnode: Vnode<IBaseEditAttrs>) {
    super.oninit(vnode);
    this.streams = await api.getRTMPStreams();

    if (!isRTMPStream(this.card.video) && isEmptyString(this.card.video as string)) {
      return;
    }

    if (isRTMPStream(this.card.video)) {
      this.isRTMP = true;
    } else {
      const { type } = parseVideoURL(this.card.video as string);
      this.isStream = STREAM_PLATFORMS.includes(type);

      if (this.isStream) {
        this.streamUrl = this.card.video as string;
      }
    }
  }

  public validate(): boolean {
    if (this.isStream) {
      if (isEmptyString(this.streamUrl)) {
        Swal.fire(`Please provide stream url for supported platforms: ${STREAM_PLATFORMS_NAMES}`);
        return false;
      }

      const { type } = parseVideoURL(this.streamUrl);

      if (!STREAM_PLATFORMS.includes(type)) {
        Swal.fire(`Please provide stream url for supported platforms: ${STREAM_PLATFORMS_NAMES}`);
        return false;
      }

      this.card.video = this.streamUrl;
    } else if (isEmptyString(this.card.video as string) && !isRTMPStream(this.card.video)) {
      Swal.fire(`Please provide card's video`, '', 'warning');
      return false;
    }

    return true;
  }

  public isRTMPChangeHandler(value: boolean) {
    this.isRTMP = value;
    this.isStream = false;

    if (value) {
      this.card.video = this.streams[0];
    } else if (isRTMPStream(this.card.video)) {
      this.card.video = undefined;
    }
  }

  public isStreamChangeHandler(value: boolean) {
    this.isStream = value;
    this.isRTMP = false;

    if (isEmptyString(this.card.video as string)) {
      return;
    }

    if (isRTMPStream(this.card.video)) {
      this.isRTMP = true;
    } else {
      const { type } = parseVideoURL(this.card.video as string);

      const isStream = STREAM_PLATFORMS.includes(type);
      if (isStream != this.isStream) {
        this.card.video = null;
        if (!this.isStream) {
          this.streamUrl = '';
        }
      }
    }
  }

  public changeHideControls(value: boolean) {
    this.card.hideControls = value;

    if (value && !this.card.autoStart) {
      this.card.autoStart = true;
    }
  }

  public view() {
    return template.call(this);
  }

  public get card(): IVideoCard {
    return this._card as IVideoCard;
  }
}
