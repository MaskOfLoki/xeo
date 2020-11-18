import { ClassComponent, redraw, Vnode, VnodeDOM } from 'mithril';
import { Unsubscribable } from 'rxjs';

import { ICard, IConfig, MobilePreviewMode, ITimeline, fillDefaultConfig, IState } from '../../../../../common/common';
import { randInt } from '@gamechangerinteractive/xc-backend/utils';
import { api } from '../../services/api';
import { template } from './template';

export interface IMobilePreviewAttrs {
  mode: MobilePreviewMode;
  class: string;
  ref: (value: MobilePreview) => void;
  channelId: string;
}

export class MobilePreview implements ClassComponent<IMobilePreviewAttrs> {
  private _element: HTMLElement;
  private _url: string;
  private _mode: MobilePreviewMode;
  private _subscriptions: Unsubscribable[] = [];
  private _id: number = randInt(1000000000);
  private _channelId: string;

  public oninit(vnode: Vnode<IMobilePreviewAttrs>) {
    this.onbeforeupdate(vnode);
  }

  public onbeforeupdate({ attrs }: Vnode<IMobilePreviewAttrs>) {
    if (this._mode === attrs.mode && this._channelId === attrs.channelId) {
      return;
    }

    this._mode = attrs.mode;
    this._channelId = attrs.channelId;
    this.refresh(attrs);
  }

  private async refresh(attrs: IMobilePreviewAttrs) {
    if (this._channelId == null) {
      console.warn(`channelId isn't provided: ` + this.constructor.name);
    }

    this._url = GC_PRODUCTION
      ? `../?previewMode=${this._mode}&previewId=${this._id}&channel=${this._channelId}`
      : `http://localhost:8081/?gcClientId=${api.cid}&previewMode=${this._mode}&previewId=${this._id}&channel=${this._channelId}`;

    if (this._mode !== MobilePreviewMode.EVENT) {
      await this.waitForPreview();

      if (attrs.ref) {
        attrs.ref(this);
      }

      this._subscriptions.forEach((item) => item.unsubscribe());

      const namespaces = ['common'];

      if (this._channelId !== undefined) {
        namespaces.push(this._channelId);
      }

      this._subscriptions = [
        api.config(...namespaces).subscribe(this.updateConfig.bind(this)),
        api.state(...namespaces).subscribe(this.stateHandler.bind(this)),
      ];
    }
    //redraw();
  }

  public oncreate(vnode: VnodeDOM<IMobilePreviewAttrs>) {
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

  private stateHandler(value: IState) {
    this.postMessage({
      type: 'updateMarketingMessages',
      id: this._id,
      marketingMessages: value.marketingMessages ?? [],
    });
  }

  public updateCard(card: ICard) {
    this.postMessage({
      type: 'updateCard',
      id: this._id,
      card,
    });
  }

  public updateConfig(config: IConfig) {
    config = fillDefaultConfig(config);
    this.postMessage({
      type: 'updateConfig',
      id: this._id,
      config,
    });
  }

  public playTimeline(timeline: ITimeline) {
    this.postMessage({
      type: 'playTimeline',
      id: this._id,
      timeline,
    });
  }

  public pauseTimeline(timeline: ITimeline, position: number) {
    this.postMessage({
      type: 'pauseTimeline',
      id: this._id,
      timeline,
      position,
    });
  }

  public seekTimeline(timeline: ITimeline, position: number) {
    this.postMessage({
      type: 'seekTimeline',
      id: this._id,
      timeline,
      position,
    });
  }

  private postMessage(value) {
    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(value, '*');
    }
  }

  public view(vnode: Vnode<IMobilePreviewAttrs>) {
    return template.call(this, vnode);
  }

  public onremove() {
    window.removeEventListener('resize', redraw);
    this._subscriptions.forEach((item) => item.unsubscribe());
  }

  public get url(): string {
    return this._url;
  }

  public get width(): number {
    return this._element?.offsetWidth || 0;
  }

  private get iframe(): HTMLIFrameElement {
    return this._element.querySelector('iframe');
  }
}
