import { GCRPC } from '@gamechangerinteractive/xc-backend/GCRPC';
import ENV from '../../../../common/utils/environment';
import { gcBackend } from '@gamechangerinteractive/xc-backend';
import { ITeamPlayConfig } from '../../../../common/common';

export class UserGroupService extends GCRPC {
  constructor() {
    super(ENV.USER_GROUP_URL, gcBackend);
  }

  public loadChannelTeamsConfig(channelId: string): Promise<ITeamPlayConfig> {
    return this.call('loadChannelTeamsConfig', channelId);
  }

  public saveChannelTeamsConfig(channelId: string, config: ITeamPlayConfig): Promise<void> {
    return this.call('saveChannelTeamsConfig', channelId, config);
  }
}
