import { template } from './template';
import { api } from '../../../../../services/api';
import { IState } from '../../../../../../../../common/common';
import { ChannelStateComponent, IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';

export class BannerControls extends ChannelStateComponent<IChannelStateAttrs> {
  private _showMarketingMessages: boolean;

  protected stateHandler(value: IState) {
    super.stateHandler(value);
    this._showMarketingMessages = value?.showMarketingMessages === undefined || value.showMarketingMessages;
  }

  public toggleShowMarketingMessages(value: boolean) {
    this._showMarketingMessages = value;
    api.toggleMarketingMessages(value, this._channelId);
  }

  public view() {
    return template.call(this);
  }

  public get showMarketingMessages(): boolean {
    return this._showMarketingMessages;
  }
}
