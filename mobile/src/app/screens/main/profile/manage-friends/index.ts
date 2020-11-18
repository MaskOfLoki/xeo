import { ClassComponent, redraw } from 'mithril';
import { template } from './template';
import { IFriendsGroup, IUserGroup, IUserGroupMember, UserGroupType } from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import Swal from 'sweetalert2';
import route from 'mithril/route';

export class ManageFriendsScreen implements ClassComponent {
  public tabs: string[] = ['Active', 'Removed'];
  public selectedTab = 0;
  private _friends: IUserGroupMember[] = [];
  public group: IFriendsGroup;

  public async oninit() {
    const groups: IUserGroup[] = await api.userGroups.getMyGroups();
    this.group = groups.find((group) => group.type === UserGroupType.FRIENDS) as IFriendsGroup;
    this.refresh();
  }

  private async refresh() {
    if (!this.group) {
      return;
    }

    this._friends = await api.userGroups.getGroupMembers(this.group._id);
    redraw();
  }

  public tabChangeHandler(value: number) {
    this.selectedTab = value;
  }

  public async buttonAddRemoveHandler(friend: IUserGroupMember) {
    if (this.selectedTab === 0) {
      await api.userGroups.removeGroupMember(this.group._id, friend.uid);
    } else {
      await api.userGroups.restoreGroupMember(this.group._id, friend.uid);
    }

    this.refresh();
  }

  public async buttonDeleteHandler() {
    const result = await Swal.fire({
      text: 'Are you sure you want to remove the Group?',
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    await api.userGroups.deleteGroup(this.group._id);
    route.set('/profile');
  }

  public view() {
    return template.call(this);
  }

  public get friends(): IUserGroupMember[] {
    if (this.selectedTab === 1) {
      return this._friends.filter((item) => item.removed);
    } else {
      return this._friends.filter((item) => !item.removed);
    }
  }
}
