import { redraw } from 'mithril';
import { template } from './template';
import { IMarketingMessage, MARKETING_MESSAGE_MAX_LENGTH, IState } from '../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { ClassBaseComponent } from '../class-base';
import { orientation } from '../../services/OrientationService';

export class MarketingMessage extends ClassBaseComponent {
  private _message: IMarketingMessage;
  private _messages: IMarketingMessage[];
  private _filteredMessages: IMarketingMessage[] = [];
  private _currentIndex: number;
  private _timer: number;

  constructor() {
    super();
  }

  protected stateHandler(value: IState) {
    this.messagesHandler(value.marketingMessages);
  }

  private orientationHandler() {
    this._filteredMessages = this._messages;

    this.stop();
    this._currentIndex = -1;
    this.showNextMessage();
  }

  public clickHandler() {
    if (!isEmptyString(this._message?.url)) {
      window.open(this._message.url, '_blank');
    }
  }

  private messagesHandler(values: IMarketingMessage[]) {
    this._messages = values || [];

    this._filteredMessages = this._messages;

    if (this._filteredMessages.length === 0) {
      this.stop();
      return;
    }

    if (this._message && !this._filteredMessages.find((item) => item.id === this._message.id)) {
      this.stop();
    }

    if (this._currentIndex == null) {
      this.orientationHandler();
    }
  }

  private showNextMessage(): void {
    if (this._filteredMessages.length === 0) {
      this.stop();
      return;
    }

    this._currentIndex++;

    if (this._currentIndex >= this._filteredMessages.length) {
      this._currentIndex = 0;
    }

    this._message = this._filteredMessages[this._currentIndex];

    if (this._message && !isEmptyString(this._message.text)) {
      this._message.text = this._message.text.slice(0, MARKETING_MESSAGE_MAX_LENGTH);
    }

    this._timer = window.setTimeout(this.showNextMessage.bind(this), this._message.timer * 1000);
    redraw();
  }

  private stop() {
    clearTimeout(this._timer);
    this._currentIndex = undefined;
    this._message = undefined;
    redraw();
  }

  public view(vnode) {
    return template.call(this, vnode.attrs);
  }

  public onremove() {
    super.onremove();
    clearTimeout(this._timer);
  }

  public get message(): IMarketingMessage {
    return this._message;
  }
}
