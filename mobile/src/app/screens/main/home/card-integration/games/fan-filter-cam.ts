import { CardIntegrationScreen } from '..';
import { IFanFilterCamCard, IUser } from '../../../../../../../../common/common';
import { OutgoingEvents } from '../../../../../../../../common/types/playcanvas';
import { api } from '../../../../../services/api';
import { VnodeDOM } from 'mithril';

export class FFCIntegrationScreen extends CardIntegrationScreen {
  private _preview: boolean;

  public oncreate(vnode: VnodeDOM): void {
    super.oncreate(vnode);
    this._subscriptions.push(api.user.subscribe(this.userHandler.bind(this)));
  }

  private userHandler(value: IUser): void {
    if (value.username === 'preview') {
      this._preview = true;
    }
  }

  protected onReady() {
    this.sendMessage({
      event: OutgoingEvents.CONFIG,
      data: this.buildConfig(),
    });

    if (this._preview) {
      this.sendMessage({
        event: OutgoingEvents.USER,
        data: {
          preview: true,
        },
      });
    }
  }

  protected updateConfig(): void {
    super.updateConfig();

    this.sendMessage({
      event: OutgoingEvents.CONFIG,
      data: this.buildConfig(),
    });
  }

  private buildConfig(): any {
    const card = this._card as IFanFilterCamCard;
    const config: any = {};
    config.clientId = api.cid;
    config.images = card.images;
    config.filters = {
      emoji: card.filters.emoji,
      animal: card.filters.animal,
      custom: Object.values(card.filters.custom),
    };

    return config;
  }
}
