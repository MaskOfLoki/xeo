import { IUserGroupsService } from './IUserGroupsService';
import {
  IFriendsGroup,
  IGroupUserData,
  ITeamCodeRequirement,
  ITeamGroup,
  IUserGroup,
  IUserGroupMember,
} from '../../../../../../common/common';
import { loading } from '../../../../../../common/loading';
import { api } from '../index';
import { toPromise } from '../../../utils';

export class APIUserGroupsService implements IUserGroupsService {
  constructor(private _service: IUserGroupsService) {}

  public deleteGroup(groupId: string): Promise<void> {
    return loading.wrap(this._service.deleteGroup(groupId));
  }

  public getFriendsGroup(): Promise<IFriendsGroup> {
    return loading.wrap(this._service.getFriendsGroup());
  }

  public getFriendsGroupCode(): Promise<string> {
    return loading.wrap(this._service.getFriendsGroupCode());
  }

  public getGroupMembers(groupId: string): Promise<IUserGroupMember[]> {
    return loading.wrap(this._service.getGroupMembers(groupId));
  }

  public getMyGroups(): Promise<IUserGroup[]> {
    return loading.wrap(this._service.getMyGroups());
  }

  public getTeam(): Promise<ITeamGroup> {
    return loading.wrap(this._service.getTeam());
  }

  public isTeamCodeRequired(channelId: string): Promise<ITeamCodeRequirement> {
    return loading.wrap(this._service.isTeamCodeRequired(channelId));
  }

  public async joinFriendsGroup(code: string, data?): Promise<void> {
    const user = await toPromise(api.user);
    return loading.wrap(
      this._service.joinFriendsGroup(code, {
        username: user.username,
        avatar: user.avatar,
      }),
    );
  }

  public async joinTeamByPin(channelId: string, pinCode: string, data: IGroupUserData): Promise<string> {
    const user = await toPromise(api.user);
    return loading.wrap(
      this._service.joinTeamByPin(channelId, pinCode, {
        username: user.username,
        avatar: user.avatar,
      }),
    );
  }

  public leaveFriendsGroup(): Promise<void> {
    return loading.wrap(this._service.leaveFriendsGroup());
  }

  public removeGroupMember(groupId: string, uid: string): Promise<void> {
    return loading.wrap(this._service.removeGroupMember(groupId, uid));
  }

  public restoreGroupMember(groupId: string, uid: string): Promise<void> {
    return loading.wrap(this._service.restoreGroupMember(groupId, uid));
  }
}
