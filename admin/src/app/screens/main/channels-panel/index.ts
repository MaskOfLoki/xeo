import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';
import { IChannel, ChannelType } from '../../../../../../common/common';
import Swal from 'sweetalert2';
import { isEmptyString, uuid } from '@gamechangerinteractive/xc-backend/utils';
import { api } from '../../../services/api';

export interface IChannelsPanelAttrs {
  onsave: (value: IChannel) => void;
  onchange: (value: IChannel) => void;
  channels: IChannel[];
  selected: IChannel;
}

export const CHANNEL_TITLE_LENGTH = 10;

export class ChannelsPanel implements ClassComponent<IChannelsPanelAttrs> {
  private _onsave: (value: IChannel) => void;
  private _onchange: (value: IChannel) => void;
  private _selected: IChannel;
  private _channels: IChannel[];

  public onbeforeupdate(vnode: Vnode<IChannelsPanelAttrs>) {
    this._onsave = vnode.attrs.onsave;
    this._channels = vnode.attrs.channels;
  }

  public async buttonAddChannelHandler() {
    const result = await Swal.fire({
      title: `Channel Name (Maximum ${CHANNEL_TITLE_LENGTH})`,
      input: 'text',
      inputAttributes: {
        maxlength: CHANNEL_TITLE_LENGTH.toString(),
      },
      inputValidator: (value) => {
        if (isEmptyString(value)) {
          return 'Name cannot be empty';
        }

        if (this._channels.find((ch) => ch.name === value)) {
          return 'A channel with this name already exists';
        }
      },
    });

    if (isEmptyString(result.value)) {
      return;
    }

    const name = result.value.substr(0, CHANNEL_TITLE_LENGTH);

    this._onsave({
      id: uuid(),
      name,
      type: ChannelType.MANUAL,
      cards: [],
      timeline: { cards: [] },
      showMedia: true,
      cardSets: [
        {
          id: 0,
          name: 'DEFAULT',
        },
      ],
    });
  }

  public channelClickHandler(value: IChannel) {
    if (value.id !== this._selected.id) {
      this._onchange(value);
    }
  }

  public nameChangeHandler(channel: IChannel, name: string): void {
    const existing = this._channels.find((ch) => ch.name === name);
    if (existing && existing !== channel) {
      Swal.fire('A channel with this name already exists', '', 'warning');
      return;
    }

    channel.name = name;
    this._onsave(channel);
  }

  public view({ attrs }: Vnode<IChannelsPanelAttrs>) {
    this._onsave = attrs.onsave;
    this._onchange = attrs.onchange;
    this._selected = attrs.selected;
    return template.call(this, attrs);
  }
}
