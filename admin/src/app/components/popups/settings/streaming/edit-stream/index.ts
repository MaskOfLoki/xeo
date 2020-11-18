import { template } from './template';
import { ClassComponent, Vnode, redraw } from 'mithril';
import { IRTMPStream } from '../../../../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { api } from '../../../../../services/api';

export interface IEditStreamAttrs {
  stream: IRTMPStream;
  onsave: (value: IRTMPStream) => void;
}

export class EditStream implements ClassComponent<IEditStreamAttrs> {
  public stream: IRTMPStream;
  public url: string;
  public streamKey: string;

  private _onsave: (value: IRTMPStream) => void;

  public async buttonSaveHandler() {
    if (!this.validate()) {
      return;
    }

    if (isEmptyString(this.stream.id)) {
      this.stream = await api.createRTMPStream(this.stream.name, this.getStreamUrl());
      this.callOnSave();
      return;
    }

    if (!isEmptyString(this.stream.sourceUrl) && this.getStreamUrl() !== this.stream.sourceUrl) {
      await api.removeRTMPStream(this.stream.id);
      this.stream = await api.createRTMPStream(this.stream.name, this.getStreamUrl());
      this.callOnSave();
      return;
    }

    await api.savePreset(this.stream);
    this.callOnSave();
  }

  private callOnSave() {
    redraw();
    this._onsave && this._onsave(this.stream);
  }

  private validate(): boolean {
    this.url = this.url.trim();
    this.stream.name = this.stream.name.trim();

    if (isEmptyString(this.stream.name)) {
      Swal.fire('Please provide stream name');
      return;
    }

    if (isEmptyString(this.streamKey)) {
      Swal.fire('Please provide stream key');
      return;
    }

    if (isEmptyString(this.url)) {
      Swal.fire('Please provide stream url');
      return;
    }

    if (!validURL(this.url) && this.url.startsWith('rtmp://')) {
      Swal.fire('Please provide valid RTMP stream url');
      return;
    }

    return true;
  }

  public view({ attrs }: Vnode<IEditStreamAttrs>) {
    this._onsave = attrs.onsave;

    if (this.stream !== attrs.stream) {
      this.stream = attrs.stream;
      this.initModel();
    }

    return template.call(this);
  }

  public getStreamUrl() {
    return this.url + '/' + this.streamKey;
  }

  public initModel() {
    if (this.stream) {
      const paths = this.stream.sourceUrl.split('/');
      this.streamKey = paths[paths.length - 1];
      this.url = paths.slice(0, -1).join('/');
    }
  }
}

function validURL(str: string): boolean {
  const pattern = new RegExp(
    '^(rtmp?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
}
