import { gcBackend } from '@gamechangerinteractive/xc-backend';
import { GCRPC } from '@gamechangerinteractive/xc-backend/GCRPC';
import {
  IFriendsGroup,
  ITeamCodeRequirement,
  IUserGroup,
  IUserGroupMember,
  IGroupUserData,
  ITeamGroup,
  UserGroupType,
} from '../../../../../../common/common';
import { IUserGroupsService } from './IUserGroupsService';
import lru from 'tiny-lru';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import ENV from '../../../../../../common/utils/environment';

export class WorkerUserGroupsService extends GCRPC implements IUserGroupsService {
  private _cache = lru(100, 60000);

  constructor() {
    super(ENV.USER_GROUP_URL, gcBackend);
    this.setAttempts(2);
  }

  public async getMyGroups(): Promise<IUserGroup[]> {
    let cachedGroups: IUserGroup[] = this._cache.get('groups');

    if (!cachedGroups) {
      cachedGroups = await this.call('getMyGroups');
    }

    return cachedGroups;
  }

  public async getFriendsGroup(): Promise<IFriendsGroup> {
    const result = await this.getMyGroups();
    return result.find((item) => item.type === UserGroupType.FRIENDS) as IFriendsGroup;
  }

  public async getFriendsGroupCode(): Promise<string> {
    let cachedCode = this._cache.get('friendsGroupCode');

    if (isEmptyString(cachedCode)) {
      this._cache.delete('groups');
      cachedCode = await this.call('getFriendsGroupCode');
      this._cache.set('friendsGroupCode', cachedCode);
    }

    return cachedCode;
  }

  public joinFriendsGroup(code: string, data): Promise<void> {
    return this.call('joinFriendsGroup', code, data);
  }

  public joinTeamByPin(channelId: string, pinCode: string, data: IGroupUserData): Promise<string> {
    return this.call('joinTeamByPin', channelId ?? '', pinCode, data);
  }

  public isTeamCodeRequired(channelId: string): Promise<ITeamCodeRequirement> {
    return this.call('isTeamCodeRequired', channelId);
  }

  public deleteGroup(groupId: string): Promise<void> {
    this._cache.delete('groups');
    return this.call('deleteGroup', groupId);
  }

  public getGroupMembers(groupId: string): Promise<IUserGroupMember[]> {
    return this.call('getGroupMembers', groupId);
  }

  public removeGroupMember(groupId: string, uid: string): Promise<void> {
    return this.call('removeGroupMember', groupId, uid);
  }

  public restoreGroupMember(groupId: string, uid: string): Promise<void> {
    return this.call('restoreGroupMember', groupId, uid);
  }

  public leaveFriendsGroup(): Promise<void> {
    this._cache.delete('groups');
    return this.call('leaveFriendsGroup');
  }

  public async getTeam(): Promise<ITeamGroup> {
    const result = await this.getMyGroups();
    return result.filter((item) => item.type === UserGroupType.TEAM)[0] as ITeamGroup;
  }
}
