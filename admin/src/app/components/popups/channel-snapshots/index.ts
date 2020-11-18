import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../common/popups/PopupManager';
import { IChannel } from '../../../../../../common/common';
import { ISnapshot } from '../../../services/api/snapshots/models';
import { Vnode, redraw } from 'mithril';
import { channelsSnapshots } from '../../../services/ChannelsSnapshotsService';
import Swal from 'sweetalert2';
import { loading } from '../../../../../../common/loading';

export interface IChannelSnapshotsPopupAttrs extends IPopupAttrs {
  channel: IChannel;
}

export class ChannelSnapshotsPopup extends PopupComponent<IChannelSnapshotsPopupAttrs> {
  public snapshots: Array<ISnapshot<IChannel>> = [];

  public async oninit(vnode: Vnode<IChannelSnapshotsPopupAttrs>) {
    super.oninit(vnode);
    this.snapshots = await loading.wrap(channelsSnapshots.get(vnode.attrs.channel.id));
    redraw();
  }

  public async restoreHandler(value: ISnapshot<IChannel>) {
    const result = await Swal.fire({
      title: 'Are sure you want to restore the snapshot? It will override current content of the channel.',
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    this.close(value.data);
  }

  public view() {
    return template.call(this);
  }
}
