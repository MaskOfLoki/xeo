import { Vnode } from 'mithril';
import { template } from './template';
import basicContext from 'basiccontext';
import { Unsubscribable } from 'rxjs';
import {
  STREAM_PLATFORMS_NAMES,
  STREAM_PLATFORMS,
  EmbeddedVideo,
} from '../../../../../../../../common/types/EmbeddedVideo';
import { fileService } from '../../../../../services/FileService';
import Swal from 'sweetalert2';
import { parseVideoURL } from '../../../../../../../../common/utils';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { IChannel, IRTMPStream, IConfig } from '../../../../../../../../common/common';
import { ChannelStateComponent, IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';
import { api } from '../../../../../services/api';

const MAX_FILE_SIZE = 100;

export interface ITimelineControlsAttrs extends IChannelStateAttrs {
  ontoggleplay?: (value: boolean) => void;
  onprevcard?: VoidFunction;
  onnextcard?: VoidFunction;
  playing?: boolean;
  style?: string;
  onsave: (value: IChannel) => void;
}

export class TimelinePanelHeader extends ChannelStateComponent<ITimelineControlsAttrs> {
  private _onsave: (value: IChannel) => void;
  private _subscription: Unsubscribable;
  public enableChatroom = false;

  public oncreate() {
    this._subscription = api.config('common').subscribe(this.configHandler.bind(this));
  }

  public onremove() {
    this._subscription.unsubscribe();
  }

  private configHandler(value: IConfig) {
    this.enableChatroom = value.misc?.enableChatroom;
  }

  public async buttonMediaHandler(e: MouseEvent) {
    const streams = await api.getRTMPStreams();

    const items: any[] = [
      {
        title: 'Video File',
        fn: this.mediaFileHandler.bind(this),
      },
      {
        title: `Video Stream: ${STREAM_PLATFORMS_NAMES}`,
        fn: this.mediaStreamHandler.bind(this),
      },
    ];

    if (streams.length > 0) {
      items.push(
        {
          title: 'RTMP Streams:',
          disabled: true,
        },
        ...streams.map((stream) => {
          return {
            title: stream.name,
            fn: this.mediaRTMPHandler.bind(this, stream),
          };
        }),
      );
    }

    if (this.channel.media) {
      items.push({
        title: 'Remove Media',
        fn: this.mediaRemoveHandler.bind(this),
      });
    }

    if (this.enableChatroom) {
      items.push({
        title: `${this.channel.showChatroom ? 'Hide' : 'Show'} Chatroom`,
        fn: this.chatroomHandler.bind(this),
      });
    }

    basicContext.show(items, e);
  }

  private chatroomHandler() {
    this.channel.showChatroom = !this.channel.showChatroom;
    this._onsave(this.channel);
  }

  private async mediaFileHandler() {
    const file = await fileService.select('.mp4');

    if (!file) {
      return;
    }

    if (file.size / 1024 / 1024 > MAX_FILE_SIZE) {
      Swal.fire(`Maximum file size is ${MAX_FILE_SIZE} MB`, '', 'warning');
      return;
    }

    const part = file.name.split('.').slice(-1)[0];

    if (!this.validMimeType(mimeToExtSpecial[part] ?? part)) {
      Swal.fire(`Can't upload that file type here. Valid extensions: ${extensions['video']}`, '', 'warning');
      return;
    }

    api.markAdminAction('TIMELINE MEDIA SET', { type: 'FILE', value: file.name });
    this.channel.media = await fileService.upload(file);
    this._onsave(this.channel);
  }

  private async mediaStreamHandler() {
    const { value } = await Swal.fire({
      title: 'Video Stream URL',
      text: `Supported Platforms: ${STREAM_PLATFORMS_NAMES}`,
      input: 'text',
      showCancelButton: true,
      preConfirm: (value) => {
        const { type } = parseVideoURL(value);

        if (!STREAM_PLATFORMS.includes(type)) {
          Swal.showValidationMessage('Unsupported streaming platform');
          return;
        }

        return value;
      },
    });

    if (isEmptyString(value)) {
      return;
    }

    const { type } = parseVideoURL(value);

    if (type === EmbeddedVideo.YouTube) {
      Swal.fire({
        title: 'YouTube Livestream Instructions',
        html: `If you are trying to use a youtube livestream, please make sure the associated channel has the following enabled at <a href="https://www.youtube.com/features">www.youtube.com/features</a>: 'Monetization', 'Livestreaming', and 'Embedded Livestreaming'`,
      });
    }

    api.markAdminAction('TIMELINE MEDIA SET', { type: 'STREAM', value });

    this.channel.media = value;
    this._onsave(this.channel);
  }

  private mediaRTMPHandler(value: IRTMPStream) {
    this.channel.media = value;
    api.markAdminAction('TIMELINE MEDIA SET', { type: 'RTMP', value });
    this._onsave(this.channel);
  }

  private mediaRemoveHandler() {
    delete this.channel.media;
    api.markAdminAction('TIMELINE MEDIA REMOVE');
    this._onsave(this.channel);
  }

  public view({ attrs }: Vnode<ITimelineControlsAttrs>) {
    this._onsave = attrs.onsave;
    return template.call(this, attrs);
  }

  private validMimeType(type: string): boolean {
    return type && extensions['video'].includes(type);
  }
}

const extensions = {
  image: '.png, .jpg, .jpeg, .svg',
  video: '.mp4',
  sound: '.mp3',
  font: '.otf, .ttf',
  imageOrVideo: '.png, .jpg, .jpeg, .svg, .mp4',
};

const mimeToExtSpecial = {
  'svg+xml': 'svg',
  'font-sfnt': 'otf',
};
