import { CardStatus, IChannel } from '../../../../common/common';
import { cloneObject } from '@gamechangerinteractive/xc-backend/utils';
import { api } from './api';
import { ISnapshot, SnapshotType } from './api/snapshots/models';

// 15 minutes
const INTERVAL = 15 * 60 * 1000;

class ChannelsSnapshotsService {
  // channel id => channel
  private readonly _scheduledChannels: Map<string, IChannel> = new Map();
  private _promiseGetSnapshots;

  public schedule(channel: IChannel) {
    if (!this._scheduledChannels.has(channel.id)) {
      this.invalidate(channel);
    }

    this._scheduledChannels.set(channel.id, cloneObject(channel));
  }

  private async invalidate(channel: IChannel) {
    const snapshots: Array<ISnapshot<IChannel>> = await this.get(channel.id);

    if (snapshots.length === 0 || Date.now() - snapshots[0].createdAt.getTime() > INTERVAL) {
      this.createSnapshot(channel.id);
    } else {
      setTimeout(this.createSnapshot.bind(this, channel.id), INTERVAL);
    }
  }

  private createSnapshot(channelId: string) {
    const channel: IChannel = this._scheduledChannels.get(channelId);

    if (!channel) {
      return;
    }

    channel.online = false;
    channel.cards.forEach((card) => (card.status = CardStatus.INACTIVE));
    api.snapshots.create(SnapshotType.CHANNEL, channel);
    this._scheduledChannels.delete(channel.id);
  }

  public async get(channelId: string): Promise<Array<ISnapshot<IChannel>>> {
    if (!this._promiseGetSnapshots) {
      this._promiseGetSnapshots = api.snapshots.get<IChannel>(SnapshotType.CHANNEL);
    }

    const result: Array<ISnapshot<IChannel>> = await this._promiseGetSnapshots;
    this._promiseGetSnapshots = undefined;
    return removeExpiredSnapshots(result.filter((item) => item.data.id === channelId));
  }
}

function removeExpiredSnapshots(snapshots: Array<ISnapshot<IChannel>>): Array<ISnapshot<IChannel>> {
  while (snapshots.length > 10) {
    api.snapshots.remove(snapshots.pop()._id);
  }

  return snapshots;
}

export const channelsSnapshots: ChannelsSnapshotsService = new ChannelsSnapshotsService();
