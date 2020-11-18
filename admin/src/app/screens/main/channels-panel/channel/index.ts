import { ClassComponent, Vnode, redraw } from 'mithril';
import { template } from './template';
import {
  IChannel,
  ChannelType,
  ITimeline,
  IConfig,
  CardStatus,
  CardType,
  ITimelineCard,
  ITurboTriviaCard,
} from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import { fileService } from '../../../../services/FileService';
import Swal from 'sweetalert2';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { Unsubscribable } from 'rxjs';
import { CHANNEL_TITLE_LENGTH } from './../';
import { saveAs } from 'file-saver';
import ENV from '../../../../../../../common/utils/environment';
import { PopupManager } from '../../../../../../../common/popups/PopupManager';
import { removeNulls, delay } from '../../../../../../../common/utils';
import {
  generateUniqueCardId,
  generateUniqueCardName,
  generateUniqueCardSetId,
  generateUniqueCardSetName,
} from '../../../../utils';
import { SettingsPopup } from '../../../../components/popups/settings';
import { loading } from '../../../../../../../common/loading';
import Ajv from 'ajv';
import { ChannelSnapshotsPopup } from '../../../../components/popups/channel-snapshots';
import { IValidateResult } from '../../../../services/api/turbo-trivia/APITurboTriviaService';

export interface IChannelAttrs {
  channel: IChannel;
  channels: IChannel[];
  onsave: (value: IChannel) => Promise<void>;
  onnamechange: (channel: IChannel, name: string) => void;
  selected: boolean;
  onclick: VoidFunction;
}

export class Channel implements ClassComponent<IChannelAttrs> {
  private _channel: IChannel;
  private _channels: IChannel[];
  private _onsave: (value: IChannel) => Promise<void>;
  private _onnamechange: (channel: IChannel, name: string) => void;
  private _subscription: Unsubscribable;

  public isRealTimeOnly: boolean;
  public disableActionBoard: boolean;

  public oninit({ attrs }: Vnode<IChannelAttrs>) {
    this._channel = attrs.channel;
    this._channels = attrs.channels;
    this._onsave = attrs.onsave;
    this._onnamechange = attrs.onnamechange;
    this.isRealTimeOnly = true;
    this.disableActionBoard = true;
    this._subscription = api.config('common').subscribe(this.configHandler.bind(this));
  }

  private configHandler(value: IConfig) {
    if (this.isRealTimeOnly != value.misc?.isonlyrealtime) {
      this.isRealTimeOnly = value.misc?.isonlyrealtime;
    }

    if (this.disableActionBoard != value.misc?.disableactionboard) {
      this.disableActionBoard = value.misc?.disableactionboard;
    }

    redraw();
  }

  public async changeNameHander() {
    const result = await Swal.fire({
      title: `Channel Name (Maximum ${CHANNEL_TITLE_LENGTH})`,
      input: 'text',
      inputAttributes: {
        maxlength: CHANNEL_TITLE_LENGTH.toString(),
      },
      inputValue: `${this._channel.name}`,
    });

    if (isEmptyString(result.value)) {
      return;
    }

    if (this._channel.online) {
      Swal.fire('You can not change name while channel is online.');
      return;
    }

    const name = result.value.substr(0, CHANNEL_TITLE_LENGTH);

    this._onnamechange(this._channel, name);
  }

  public async settingsHandler() {
    let result;
    do {
      result = await PopupManager.show(SettingsPopup, { channel: this._channel });
      await delay(1250);
    } while (result === true);
  }

  public onremove() {
    this._subscription.unsubscribe();
  }

  public async buttonGoHandler() {
    if (this._channel.online) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'GO OFFLINE',
        text: 'Are you sure you want to take this channel offline?',
        showCancelButton: true,
      });

      if (result.dismiss) {
        return;
      }

      api.markAdminAction('CHANNEL STOP');
      this._channel.online = false;
      document.body.classList.toggle('online');

      if (this._channel.type === ChannelType.MANUAL) {
        this._channel.timeline.cards = [];
      }

      this._channel.cards.forEach((card) => (card.status = CardStatus.INACTIVE));
      await this._onsave(this._channel);
      await api.stopChannel(this._channel);
    } else {
      if (this._channel.type === ChannelType.TIMELINE) {
        if (this._channel.timeline.cards.length === 0) {
          Swal.fire('Please add at least one card to the timeline');
          return;
        }

        if (!this._channel.media || (typeof this._channel.media === 'string' && isEmptyString(this._channel.media))) {
          Swal.fire('Please provide a media for the timeline');
          return;
        }
      } else {
        if (this._channel.cards.length === 0) {
          Swal.fire('Please add at least one card to the channel');
          return;
        }

        this._channel.timeline.cards = [];
      }

      this._channel.online = true;
      document.body.classList.toggle('online');
      // Turbo Trivia Start

      if (this._channel.type === ChannelType.TIMELINE) {
        const turboTriviaCards = [];
        this._channel.timeline.cards.map((card: ITimelineCard) => {
          if (card.type === CardType.TURBO_TRIVIA_2) {
            turboTriviaCards.push(card);
          }
        });

        if (turboTriviaCards.length > 2) {
          Swal.fire('There should be only one turbo trivia in the timeline.');
          return;
        }

        if (turboTriviaCards.length == 1) {
          const card: ITurboTriviaCard = turboTriviaCards[0];

          const isAutoRun = this._channel.synced;
          const isFreePlay = !this._channel.synced;

          const error: IValidateResult = await api.turbotrivia.validateGame(
            card.slot,
            isFreePlay,
            isAutoRun,
            Math.floor(card.timers.revealTimer / 1000),
            Math.floor(card.timers.intermissionTimer / 1000),
            card.id,
          );

          if (!isEmptyString(error.result)) {
            Swal.fire({
              title: error.result,
              icon: 'warning',
            });
            return;
          }

          api.turbotrivia.publishGame(
            error.slot.data,
            isFreePlay,
            isAutoRun,
            Math.floor(card.timers.revealTimer / 1000),
            Math.floor(card.timers.intermissionTimer / 1000),
          );
        }
      }

      api.markAdminAction('CHANNEL START');
      await this._onsave(this._channel);
      await api.startChannel(this._channel);
    }
  }

  public async buttonTypeHandler() {
    if (this._channel.type === ChannelType.MANUAL) {
      await this.switchToTimeline();
    } else {
      await this.switchToManual();
    }

    this._onsave(this._channel);
  }

  private async switchToManual() {
    if (this._channel.timeline.cards.length > 0) {
      const result = await Swal.fire({
        title: 'Are you sure you want to switch REALTIME mode? It will remove all cards from the timeline.',
        showCancelButton: true,
      });

      api.markAdminAction('CHANNEL TO REALTIME');

      if (result.dismiss) {
        return;
      }
    }

    this._channel.type = ChannelType.MANUAL;
    this._channel.timeline.cards = [];
    delete this._channel.media;
    delete this._channel.timeline.duration;
  }

  private async switchToTimeline() {
    this._channel.type = ChannelType.TIMELINE;
    const saveTimeline: ITimeline = await api.getSavedTimeline(this._channel.id);

    api.markAdminAction('CHANNEL TO PROGRAMMED');

    if (saveTimeline) {
      this._channel.timeline = saveTimeline;
      api.deleteSavedTimeline(this._channel.id);
    }
  }

  public async mobileURLHandler() {
    const url: string = GC_PRODUCTION
      ? `../?channel=${this._channel.id}`
      : `http://localhost:8081/?gcClientId=${api.cid}&channel=${this._channel.id}`;

    const result = await Swal.fire({
      title: 'Mobile URL',
      input: 'text',
      inputValue: url,
      confirmButtonText: 'COPY',
      cancelButtonText: 'OPEN',
      showCancelButton: true,
      onBeforeOpen(popup: HTMLElement) {
        const input: HTMLInputElement = popup.querySelector('input');
        input.readOnly = true;
        popup.style.width = '60vw';
      },
      preConfirm() {
        Swal.getContent().querySelector('input').select();
        document.execCommand('copy');
        return true;
      },
    });

    if (result.dismiss === Swal.DismissReason.cancel) {
      window.open(url, '_blank');
    }
  }

  public mainboardURLHandler() {
    const url: string = GC_PRODUCTION
      ? `../mainboard/?channel=${this._channel.id}`
      : `http://localhost:8082/?channel=${this._channel.id}`;
    window.open(url, '_blank');
  }

  public feedHandler(format: string) {
    window.open(`${ENV.CHANNEL_FEED_URL}&c=${api.cid}&ch=${this._channel.id}&format=${format}`);
  }

  public launchAdminHandler() {
    const url: string = GC_PRODUCTION
      ? `../admin?channel=${this._channel.id}`
      : `http://localhost:8080/?channel=${this._channel.id}`;
    window.open(url, '_blank');
  }

  public actionBoardHandler(): void {
    const url: string = GC_PRODUCTION
      ? `../actionboard?channel=${this._channel.id}`
      : `http://localhost:8084/?gcClientId=${api.cid}&channel=${this._channel.id}`;
    window.open(url, '_blank');
  }

  public async deleteChannelHandler(): Promise<void> {
    const result = await Swal.fire({
      title: `Are you sure that you want to delete the '${this._channel.name}' channel?`,
      text: 'You can restore your deleted channels in Delete Channels Menu.',
      allowEnterKey: false,
      showCancelButton: true,
      cancelButtonText: 'No',
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      api.markAdminAction('CHANNEL DELETE', { name: this._channel.name });
      this._channel.deleted = api.time();
      this._onsave(this._channel);
    }
  }

  public exportChannelHandler() {
    removeNulls(this._channel);
    api.markAdminAction('CHANNEL EXPORT');
    const blob = new Blob([JSON.stringify(this._channel)], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${this._channel.name}.json`);
  }

  public async importChannelHandler() {
    const file: File = await fileService.select('.json');

    if (!file) {
      return;
    }

    const content: string = await fileService.readFileAsText(file);

    try {
      const data: IChannel = JSON.parse(content);
      removeNulls(data);
      const schema = await loading.wrap(import('../../../../../../../common/schemas/channel.json'));
      const ajv = new Ajv();
      const valid = ajv.validate(schema, data);

      if (!valid) {
        throw ajv.errors;
      }

      const result = await Swal.fire({
        title: `Do you want to replace or add cards?`,
        confirmButtonText: 'Replace',
        showCancelButton: true,
        cancelButtonText: 'Add',
      });

      if (result.dismiss) {
        api.markAdminAction('CHANNEL IMPORT', { type: 'APPEND', name: this._channel.name });
        data.cardSets.forEach((cardSet) => {
          const oldCardSet = this._channel.cardSets.find((cardSet1) => cardSet1.id === cardSet.id);

          if (!oldCardSet) {
            const cardSetWithSameName = this._channel.cardSets.find((cardSet1) => cardSet1.name === cardSet.name);
            if (cardSetWithSameName) {
              const newCardSetName = generateUniqueCardSetName(this._channel, cardSet.name);
              this._channel.cardSets.push({
                id: cardSet.id,
                name: newCardSetName,
              });
            } else {
              this._channel.cardSets.push(cardSet);
            }
          } else if (oldCardSet.name !== cardSet.name) {
            const newCardSetId = generateUniqueCardSetId(this._channel);
            this._channel.cardSets.push({
              id: newCardSetId,
              name: cardSet.name,
            });

            data.cards.forEach((card) => {
              if (card.cardSetId === oldCardSet.id) {
                card.cardSetId = newCardSetId;
              }
            });
          }
        });
        data.cards.forEach((card) => {
          let newCardName = card.name;

          if (this._channel.cards.find((card1) => card1.name === newCardName)) {
            newCardName = generateUniqueCardName(this._channel, card.name);
          }

          this._channel.cards.push({
            ...card,
            id: generateUniqueCardId(this._channel),
            name: newCardName,
          });
        });
      } else {
        api.markAdminAction('CHANNEL IMPORT', { type: 'REPLACE', oldName: this._channel.name, newName: data.name });
        data.id = this._channel.id;

        let index = 1;
        let channelName = data.name;

        while (this._channels.find((c) => c.name === channelName && c.id !== data.id)) {
          channelName = `${data.name.slice(0, 11 - index.toString().length + 1)}-${index++}`;
        }
        data.name = channelName;
        this._channel = data;
      }

      this._onsave(this._channel);
    } catch (e) {
      console.warn('Menu.importChannelHandler error', e);
      Swal.fire({
        icon: 'error',
        title: 'Invalid channel file',
      });
    }
  }

  public async snapshotsHandler() {
    const channel: IChannel = await PopupManager.show(ChannelSnapshotsPopup, { channel: this._channel });

    if (!channel) {
      return;
    }

    this._onsave(channel);
  }

  public view({ attrs }: Vnode<IChannelAttrs>) {
    if (this._channel?.id !== attrs.channel.id) {
      if (this._subscription) {
        this._subscription.unsubscribe();
      }

      this._subscription = api.config(attrs.channel.id).subscribe(this.configHandler.bind(this));
    }

    this._channel = attrs.channel;
    return template.call(this, attrs);
  }
}
