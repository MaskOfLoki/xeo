import {
  IFriendsGroup,
  IGroupUserData,
  ITeamCodeRequirement,
  ITeamGroup,
  IUserGroup,
  IUserGroupMember,
} from '../../../../../../common/common';

export interface IUserGroupsService {
  getMyGroups(): Promise<IUserGroup[]>;
  getFriendsGroup(): Promise<IFriendsGroup>;
  getFriendsGroupCode(): Promise<string>;
  joinFriendsGroup(code: string, data?): Promise<void>;
  getGroupMembers(groupId: string): Promise<IUserGroupMember[]>;
  removeGroupMember(groupId: string, uid: string): Promise<void>;
  restoreGroupMember(groupId: string, uid: string): Promise<void>;
  deleteGroup(groupId: string): Promise<void>;
  joinTeamByPin(channelId: string, pinCode: string, data: IGroupUserData): Promise<string>;
  isTeamCodeRequired(channelId: string): Promise<ITeamCodeRequirement>;
  getTeam(): Promise<ITeamGroup>;
  leaveFriendsGroup(): Promise<void>;
}
