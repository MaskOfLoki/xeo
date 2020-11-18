import { ClassComponent, redraw, Vnode, VnodeDOM } from 'mithril';
import { api } from '../../services/api';
import { template } from './template';
import {
  MainboardLayout,
  MainboardZone,
  MainboardPreviewMode,
  fillDefaultConfig,
  DEFAULT_MAINBOARD_CONFIG,
} from '../../../../../common/common';
import { randInt } from '@gamechangerinteractive/xc-backend/utils';
import { Unsubscribable } from 'rxjs';

export interface IMainboardPreviewAttrs {
  class: string;
  channelId: string;
  ref: (value: MainboardPreview) => void;
  mode: MainboardPreviewMode;
}

export class MainboardPreview implements ClassComponent<IMainboardPreviewAttrs> {
  private _element: HTMLElement;
  private _mode: MainboardPreviewMode;
  private _url: string;
  private _channelId: string;
  private _subscription: Unsubscribable;
  private _id: number = randInt(1000000000);

  public oninit(vnode: Vnode<IMainboardPreviewAttrs>) {
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate({ attrs }: Vnode<IMainboardPreviewAttrs>) {
    if (this._channelId === attrs.channelId && this._mode === attrs.mode) {
      return;
    }

    if (attrs.ref) {
      attrs.ref(this);
    }

    this._channelId = attrs.channelId;
    this._mode = attrs.mode;
    this.refresh(attrs);
  }

  private async refresh(attrs: IMainboardPreviewAttrs) {
    if (this._channelId == null) {
      console.warn(`channelId isn't provided: ` + this.constructor.name);
    }

    this._url = GC_PRODUCTION
      ? `../mainboard?previewMode=${this._mode}&previewId=${this._id}&gcClientId=${api.cid}&channel=${this._channelId}`
      : `http://localhost:8082/?previewMode=${this._mode}&previewId=${this._id}&&gcClientId=${api.cid}&channel=${this._channelId}`;

    if (this._mode !== MainboardPreviewMode.EVENT) {
      await this.waitForPreview();

      if (attrs.ref) {
        attrs.ref(this);
      }

      if (this._subscription) {
        this._subscription.unsubscribe();
        this._subscription = undefined;
      }

      this._subscription = api
        .config(this._channelId, `${this._channelId}mainboard`)
        .subscribe(this.updateConfig.bind(this));
    }
  }

  public oncreate(vnode: VnodeDOM<IMainboardPreviewAttrs>) {
    this._element = vnode.dom as HTMLElement;
    window.addEventListener('resize', redraw);
    redraw();
  }

  private waitForPreview() {
    return new Promise((resolve) => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data === `previewReady${this._id}`) {
          window.removeEventListener('message', messageHandler);
          resolve();
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  public updateConfig(config) {
    config = fillDefaultConfig(config);
    config = fillDefaultConfig(config, DEFAULT_MAINBOARD_CONFIG);
    this.postMessage({
      type: 'updateConfig',
      id: this._id,
      config,
    });
  }

  public updateLayoutZone(layout: MainboardLayout, zone: MainboardZone) {
    this.postMessage({
      type: 'updateLayoutZone',
      id: this._id,
      layout,
      zone,
    });
  }

  public view(vnode: Vnode<IMainboardPreviewAttrs>) {
    return template.call(this, vnode);
  }

  public onremove() {
    window.removeEventListener('resize', redraw);

    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = undefined;
    }
  }

  public get url(): string {
    return this._url;
  }

  public get width(): number {
    return this._element?.offsetWidth || 0;
  }

  private postMessage(value) {
    this.iframe?.contentWindow?.postMessage(value, '*');
  }

  private get iframe(): HTMLIFrameElement {
    return this._element?.querySelector('iframe');
  }
}
