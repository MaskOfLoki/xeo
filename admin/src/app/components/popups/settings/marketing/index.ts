import { template } from './template';
import { redraw } from 'mithril';
import { EditMarketingMessagePopup } from './edit-popup';
import Swal from 'sweetalert2';
import { cloneObject } from '@gamechangerinteractive/xc-backend/utils';
import { ChannelStateComponent } from '../../../../utils/ChannelStateComponent';
import { IChannelAttrs } from '../../../../screens/main/channels-panel/channel';
import { IMarketingMessage, IState } from '../../../../../../../common/common';
import { PopupManager } from '../../../../../../../common/popups/PopupManager';
import { api } from '../../../../services/api';

export class MarketingSettings extends ChannelStateComponent<IChannelAttrs> {
  private _messages: IMarketingMessage[] = [];
  protected stateHandler(value: IState) {
    super.stateHandler(value);
    this.messagesHandler(value.marketingMessages);
  }

  public buttonAddMessageHandler(type) {
    PopupManager.show(EditMarketingMessagePopup, { type: type, channelId: this._channelId });
  }

  public buttonEditHandler(message: IMarketingMessage) {
    PopupManager.show(EditMarketingMessagePopup, { message: cloneObject(message), channelId: this._channelId });
  }

  public async buttonDeleteHandler(value: IMarketingMessage) {
    const { dismiss } = await Swal.fire({
      title: 'Are you sure you want to delete marketing message?',
      showCancelButton: true,
    });

    if (dismiss) {
      return;
    }

    api.deleteMarketingMessage(value, this._channelId);
  }

  private messagesHandler(value: IMarketingMessage[]) {
    this._messages = value;
    redraw();
  }

  public view() {
    return template.call(this);
  }

  public get messages(): IMarketingMessage[] {
    return this._messages;
  }
}
