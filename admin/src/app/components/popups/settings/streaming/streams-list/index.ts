import { template } from './template';
import { ClassComponent, Vnode, redraw } from 'mithril';
import { IRTMPStream } from '../../../../../../../../common/common';
import { api } from '../../../../../services/api';
import Swal from 'sweetalert2';

interface IStreamsListAttrs {
  onchange: (value: IRTMPStream) => void;
}

export class StreamsList implements ClassComponent<IStreamsListAttrs> {
  public streams: IRTMPStream[] = [];

  private _onchange: (value: IRTMPStream) => void;

  constructor() {
    this.refresh();
  }

  public oninit({ attrs }) {
    attrs.ref && attrs.ref(this);
  }

  public async refresh() {
    this.streams = await api.getRTMPStreams();
    redraw();
  }

  public async buttonDeleteHandler(stream: IRTMPStream) {
    const result = await Swal.fire({
      title: `Are you sure you want to remove "${stream.name}"?`,
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    await api.removeRTMPStream(stream.id);
    this._onchange(undefined);
    this.refresh();
  }

  public view({ attrs }: Vnode<IStreamsListAttrs>) {
    this._onchange = attrs.onchange;
    return template.call(this, attrs);
  }
}
