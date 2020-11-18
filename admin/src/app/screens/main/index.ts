import { ClassComponent, redraw } from 'mithril';
import { template } from './template';
import 'basiccontext/dist/basicContext.min.css';
import 'basiccontext/dist/themes/default.min.css';
import { IProject, IChannel, ChannelType } from '../../../../../common/common';
import { api } from '../../services/api';
import { uuid, isEmptyString, fixDate } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { getChannel } from '../../../../../common/utils/query';
import { MAX_CHANNELS, MAX_CHANNEL_DELETE_DAYS } from '../../utils';
import { delay } from '../../../../../common/utils';
import { hookService } from '../../services/HookService';
import { transformService } from '../../services/TransformService';
import { loading } from '../../../../../common/loading';
import { Unsubscribable } from 'rxjs';
import { channelsSnapshots } from '../../services/ChannelsSnapshotsService';

export class MainScreen implements ClassComponent {
  public project: IProject;
  public channel: IChannel;

  private readonly _subscriptionProject: Unsubscribable;

  constructor() {
    loading.show();
    this._subscriptionProject = api.project.subscribe(this.projectHandler.bind(this));
  }

  private async projectHandler(value: IProject) {
    if (!this.project) {
      loading.hide();
    }

    let needSave: boolean;
    this.project = value;

    if (!this.project) {
      needSave = true;

      this.project = {
        id: uuid(),
        name: 'DEFAULT',
        type: 'project',
        channels: [
          {
            id: '',
            name: '',
            cards: [],
            type: ChannelType.MANUAL,
            timeline: { cards: [] },
            version: transformService.latestVersion,
            cardSets: [
              {
                id: 0,
                name: 'DEFAULT',
              },
            ],
          },
        ],
      };
    }

    if (!this.project.channels) {
      needSave = true;

      this.project.channels = [
        {
          id: '',
          name: 'Channel 1',
          type: ChannelType.MANUAL,
          cards: [],
          timeline: { cards: [] },
          version: transformService.latestVersion,
        },
      ];
    }

    this.project.channels.forEach((channel, index) => {
      if (isEmptyString(channel.name)) {
        needSave = true;
        channel.name = `Channel ${index + 1}`;
      }

      if (channel.type === ChannelType.MANUAL && !channel.online && channel.timeline?.cards?.length > 0) {
        needSave = true;
        channel.timeline.cards = [];
      }
    });

    const selectedChannelId: string = this.channel?.id ?? getChannel() ?? '';
    this.channel = this.project.channels.find((item) => item.id === selectedChannelId);

    if (!this.channel) {
      this.channel = this.project.channels[0];
    }

    if (this.channel.type == null) {
      needSave = true;
      this.channel.type = ChannelType.MANUAL;
    }

    if (!this.channel.timeline) {
      needSave = true;
      this.channel.timeline = { cards: [] };
    }

    this.project.channels.forEach((channel) => {
      if (!channel.deleted) {
        channelsSnapshots.schedule(channel);
      }
    });

    if (needSave) {
      await api.savePreset(this.project);
    } else {
      hookService.onProjectLoad(this.project);
      this.updateBackground();
      redraw();
    }
  }

  public async restoreChannelHandler(channel: IChannel) {
    const idx = this.project.channels.findIndex((ch) => ch.id === channel.id);
    if (idx !== -1) {
      delete this.project.channels[idx].deleted;
      await api.savePreset(this.project);
    }
  }

  public async deleteChannelHandler(channel: IChannel) {
    const idx = this.project.channels.findIndex((ch) => ch.id === channel.id);
    if (idx !== -1) {
      this.project.channels.splice(idx, 1);
      await api.savePreset(this.project);
    }
  }

  public async deleteExpiredChannelHandler() {
    const expiredChannels = [];
    this.project.channels.map((ch) => {
      const time = (api.time() - ch.deleted) * 0.001;
      const days = Math.floor(time / 3600 / 24);

      if (days > MAX_CHANNEL_DELETE_DAYS) {
        expiredChannels.push(ch);
      }
    });

    if (expiredChannels.length > 0) {
      for (const expiredChannel of expiredChannels) {
        const idx = this.project.channels.findIndex((ch) => ch.id === expiredChannel.id);
        if (idx !== -1) {
          this.project.channels.splice(idx, 1);
        }
      }

      await api.savePreset(this.project);
    }
  }

  public async selectedChannelChangeHandler(value: IChannel) {
    this.channel = undefined;
    await delay(50);
    this.channel = value;
    this.updateBackground();
    redraw();
  }

  private updateBackground() {
    if (this.channel.type === ChannelType.MANUAL) {
      document.body.classList.add('realtime');
    } else {
      document.body.classList.remove('realtime');
    }
  }

  public async saveChannelHandler(channel: IChannel, showProgress = true) {
    const index = this.project.channels.findIndex((item) => item.id === channel.id);

    if (index === -1) {
      if (this.project.channels.filter((ch) => !ch.deleted).length >= MAX_CHANNELS) {
        Swal.fire({
          icon: 'warning',
          title: 'Maximum number of channels is reached',
        });
        return;
      }

      const oldChannel = this.project.channels.find((item) => item.name === channel.name);

      if (oldChannel && !oldChannel.deleted) {
        const result = await Swal.fire({
          title: 'Channel Name',
          input: 'text',
          showCancelButton: true,
          preConfirm: (value) => {
            if (isEmptyString(value)) {
              Swal.showValidationMessage('Please provide valid channel name');
              return;
            }

            if (this.project.channels.find((item) => item.name === value)) {
              Swal.showValidationMessage(`Channel "${value}" already exists. Please, provide unique channel name.`);
              return;
            }

            return value;
          },
        });

        if (result.dismiss || isEmptyString(result.value)) {
          return;
        }

        channel.name = result.value;
      }

      if (oldChannel?.deleted) {
        delete oldChannel.deleted;
      } else {
        this.project.channels.push(channel);
      }
    } else {
      this.project.channels[index] = channel;

      // Because the control panel pulls the channel from the state, a different object is created
      // and we update the reference here
      if (channel !== this.channel && channel.id == this.channel.id) {
        this.channel = channel;
      }
    }

    if (this.channel.id === channel.id && channel.deleted) {
      this.channel = this.project.channels[0];
    }

    await api.savePreset(this.project, showProgress);
    redraw();
  }

  public onremove() {
    this._subscriptionProject.unsubscribe();
  }

  public view(vnode) {
    return template.call(this, vnode);
  }
}
