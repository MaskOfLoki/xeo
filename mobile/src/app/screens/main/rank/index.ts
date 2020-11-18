import { redraw } from 'mithril';
import { template } from './template';
import { IGCLeader } from '@gamechangerinteractive/xc-backend/types/IGCLeader';
import { api } from '../../../services/api';
import { IState, IUserGroup, UserGroupType, AdminDrivenEvents } from '../../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

import { ClassBaseComponent } from '../../../components/class-base';
import { loading } from '../../../../../../common/loading';
import { route } from 'mithril';

export class RankScreen extends ClassBaseComponent {
  private _tabs: ITab[];
  private _leaders: IGCLeader[] = [];
  private _sid: string;
  private _selectedTab = 'overall';

  public yourRank: IGCLeader;

  public oninit(): void {
    api.verifyLeaderboardData();
  }

  public goToHome() {
    route.set('home');
  }

  private async refreshGroups() {
    const groups: IUserGroup[] = await loading.wrap(api.userGroups.getMyGroups());
    const friendsGroup: IUserGroup = groups.find((item) => item.type === UserGroupType.FRIENDS);

    if (friendsGroup && !this._tabs.find((item) => item.label === friendsGroup.type.toUpperCase())) {
      this._tabs.push({
        id: `${friendsGroup.type}.${friendsGroup._id}`,
        label: friendsGroup.type.toUpperCase(),
      });

      redraw();
    }

    const teamsGroup: IUserGroup = groups.find((item) => item.type === UserGroupType.TEAM);

    if (teamsGroup && !this._tabs.find((item) => item.label === teamsGroup.type.toUpperCase())) {
      this._tabs.push({
        id: `${teamsGroup.type}.${teamsGroup._id}`,
        label: teamsGroup.type.toUpperCase(),
      });

      redraw();
    }
  }

  protected async stateHandler(value: IState) {
    super.stateHandler(value);
    this._tabs = this._tabs || [];

    if (isEmptyString(value.sid)) {
      this._sid = undefined;

      if (this._tabs.length === 0) {
        this._tabs = [
          {
            id: 'overall',
            label: 'OVERALL',
          },
        ];
        this._selectedTab = 'overall';
        this.refresh();
      } else if (this._tabs.length === 2) {
        this._tabs.shift();
      }

      await this.refreshGroups();
      return;
    }

    if (this._sid === value.sid) {
      return;
    }

    this._sid = value.sid;
    this._tabs = [
      {
        id: this._sid,
        label: 'EVENT',
      },
      {
        id: 'overall',
        label: 'OVERALL',
      },
    ];

    await this.refreshGroups();
    this._selectedTab = 'overall';
    this.refresh();
  }

  private async refresh() {
    this.yourRank = undefined;
    this._leaders = await api.getLeaders(this._selectedTab, 10);

    if (!this._leaders.find((item) => item.uid === api.uid)) {
      this.yourRank = await api.getLeaderEntry(this._selectedTab);
    }

    redraw();
  }

  public tabChangeHandler(id: string) {
    if (id === this._selectedTab) {
      return;
    }

    this._selectedTab = id;
    this.refresh();
  }

  public view() {
    return template.call(this);
  }

  public get leaders(): IGCLeader[] {
    if (api.adminEvent === AdminDrivenEvents.DISPLAY_LEADERBOARD && api.adminEventData) {
      return api.adminEventData;
    }
    return this._leaders ?? [];
  }

  public get tabs() {
    return this._tabs;
  }

  public get selectedTab(): string {
    return this._selectedTab;
  }
}

interface ITab {
  id: string;
  label: string;
}
