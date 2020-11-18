import { template } from './template';
import { PopupComponent } from '../../../../../../common/popups/PopupManager';
import { api } from '../../../services/api';
import { ILeadersRequest, IResetLeadersRequest, toPromise } from '../../../utils';
import { redraw } from 'mithril';
import { IChannel, ICoupon, IState, IUser } from '../../../../../../common/common';
import Swal from 'sweetalert2';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { PrizeChannelPanel } from './prize-channel-panel';

export enum ViewKind {
  EVENT,
  DAILY,
  BANNED_USER,
}

export class PrizeHoldersPopup extends PopupComponent<{}> {
  private _selectedUsers: IUser[] = [];

  public channels: IChannel[] = [];
  public selectedChannel: IChannel;
  public selectedState: IState;
  public selectedDay: Date;
  public selectedViewKind = ViewKind.EVENT;
  private _currentRequest: ILeadersRequest;
  private channelViews = new Map<string, PrizeChannelPanel>();

  public async oninit(vnode) {
    super.oninit(vnode);
    const project = await toPromise(api.project);
    this.channels = project.channels.filter((channel) => !channel.deleted);
    redraw();
  }

  public addChannelView(view: PrizeChannelPanel) {
    this.channelViews.set(view.channel.id, view);
  }

  public channelPanelSelectHandler(channel: IChannel, selected: boolean) {
    if (selected) {
      this.selectedChannel = channel;
      return;
    }

    if (!selected && this.selectedChannel?.id === channel?.id) {
      this.selectedChannel = undefined;
      this._selectedUsers = [];
    }
  }

  public selectedUsersHandler(values: IUser[]) {
    this._selectedUsers = values;
  }

  public awardEveryoneHandler(coupon: ICoupon) {
    if (!this.currentRequest) {
      Swal.fire('Please select leaderboard');
      return;
    }
    api.markAdminAction('LEADERBOARD AWARD', { coupon, request: this.currentRequest, type: 'ALL' });

    api.awardEveryone(coupon, this.currentRequest);
  }

  public async awardSelectedHandler(coupon: ICoupon) {
    if (this._selectedUsers.length === 0) {
      Swal.fire('Please, select at least one user to award');
      return;
    }
    api.markAdminAction('LEADERBOARD AWARD', {
      coupon,
      request: this.currentRequest,
      type: 'SELECTED',
      users: this._selectedUsers.map((user) => user.uid),
    });

    api.awardSelectedUsers(
      coupon,
      this.selectedState?.sid,
      this._selectedUsers.map((user) => user.uid),
    );

    if (coupon.textNotificationEnabled && coupon.textNotificationMessage) {
      const numbers = this._selectedUsers.filter((user) => user.phone).map((user) => user.phone);
      await api.sendSms(numbers, coupon.textNotificationMessage);
    }
  }

  public async resetScoresHandler() {
    const result = await Swal.fire({
      title: 'Are you sure you want to reset scores for the selected leaderboard?',
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    const request: IResetLeadersRequest = {
      channel: this.selectedChannel.id,
    };

    if (!isEmptyString(this.selectedState?.sid)) {
      request.lid = this.selectedState.sid;
    }

    if (this.selectedDay) {
      const start = new Date(this.selectedDay);
      start.setHours(0, 0, 0, 0);
      const end = new Date(this.selectedDay);
      end.setHours(23, 59, 59, 999);
      request.dateRange = [start, end];
    }
    api.markAdminAction('LEADERBOARD RESET', request);

    await api.resetLeaderboard(request);
    const channelView = this.channelViews.get(this.selectedChannel.id);
    channelView?.userTable.refresh();
  }

  public view() {
    return template.call(this);
  }

  public set currentRequest(value: ILeadersRequest) {
    api.markAdminAction('LEADER REQUEST CHANGE', value);
    this._currentRequest = value;
  }

  public get currentRequest(): ILeadersRequest {
    return this._currentRequest;
  }
}
