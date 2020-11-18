import { cloneObject, isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { ClassComponent, Vnode, redraw } from 'mithril';
import { GAME_ID, IChannel, IState, IUser } from '../../../../../../../../common/common';
import { PopupManager } from '../../../../../../../../common/popups/PopupManager';
import { api } from '../../../../../services/api';
import { ILeadersFilter, ILeadersRequest, IPaginatedLeadersRequest } from '../../../../../utils';
import { UserCouponPopup } from '../popups/user-coupon';
import { template } from './template';
import deepEqual from 'fast-deep-equal';

export interface IUserTableAttrs {
  channel: IChannel;
  state: IState;
  day: Date;
  banned: boolean;
  onUserSelectionChanged: (users: IUser[]) => void;
  ref: (value: UserTable) => void;
  onSendSms: (user: IUser) => void;
  onSendEmail: (user: IUser) => void;
  onBanUser: (user: IUser) => void;
  onRequestChange: (value: ILeadersRequest) => void;
}

export const PAGE_SIZE = 50;
export const PAGE_OFFSET = 5;

export class UserTable implements ClassComponent<IUserTableAttrs> {
  public currentPage = 0;
  public totalPages = 1;
  public totalUsers = 0;
  public currentStartPage = 0;
  public users = [];
  public selected = [];
  public bannedOnly: boolean;

  private _onUserSelectionChanged: (users: IUser[]) => void;
  private _filters: ILeadersFilter[] = [];
  private _state: IState;
  private _day: Date;
  private _onSendSms: (user: IUser) => void;
  private _onSendEmail: (user: IUser) => void;
  private _onBanUser: (user: IUser) => void;
  private _onRequestChange: (value: ILeadersRequest) => void;
  private _contextUser: IUser;
  private _channel: IChannel;

  public oncreate({ attrs }: Vnode<IUserTableAttrs>) {
    attrs.ref && attrs.ref(this);
  }

  public updateFilters(values: ILeadersFilter[]) {
    if (deepEqual(this._filters, values)) {
      return;
    }

    this._filters = cloneObject(values);
    this.refresh();
  }

  public async refresh() {
    this.selected = [];
    const request: IPaginatedLeadersRequest = {
      channel: this._channel.id,
      limit: PAGE_SIZE,
      skip: this.currentPage * PAGE_SIZE,
      filters: this._filters,
      bannedOnly: this.bannedOnly,
    };

    if (!isEmptyString(this._state?.sid)) {
      request.lid = `${GAME_ID}.${this._state.sid}`;
    } else if (this._day) {
      const start = new Date(this._day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(this._day);
      end.setHours(23, 59, 59, 999);
      request.dateRange = [start, end];
    } else {
      request.lid = `${GAME_ID}.overall`;
    }
    //console.log(request);

    this._onRequestChange && this._onRequestChange(request);
    const result = await api.getPaginatedLeaders(request);
    this.totalPages = Math.ceil(result.total / PAGE_SIZE);
    this.totalUsers = result.total;
    this.users = result.items;
    redraw();
  }

  public selectHandler(user) {
    const index = this.selected.indexOf(user);

    if (index === -1) {
      this.selected.push(user);
    } else {
      this.selected.splice(index, 1);
    }

    this._onUserSelectionChanged(this.selected);
  }

  public goPreviousOffsetPage() {
    this.currentStartPage = this.currentStartPage - PAGE_OFFSET;

    if (this.currentStartPage <= 0) {
      this.currentStartPage = 1;
    }

    this.refresh();
  }

  public goToPageHandler(page: number) {
    this.currentPage = page;
    this.refresh();
  }

  public goNextOffsetPage() {
    this.currentStartPage = this.currentStartPage + PAGE_OFFSET;

    if (this.currentStartPage > this.totalPages - 1) {
      this.currentStartPage = this.totalPages + PAGE_OFFSET - 1;
    }

    this.refresh();
  }

  public async showUserCoupons(userId: string) {
    const userCoupons = await api.getCouponsAwardedTo(userId);
    PopupManager.show(UserCouponPopup, { coupons: userCoupons });
  }

  public async selectRandomUsers(limit: number) {
    const leaderboard = this._state ? `${GAME_ID}.${this._state.sid}` : null;
    const selection = await api.getRandomLeaders(this._channel.id, leaderboard, limit);

    //console.log('Leaderboard----------------' + leaderboard);
    //console.log('selection----------------' + selection);
    //console.log('channel----------------' + this._channel.id);

    this.totalPages = 1;
    this.totalUsers = selection.total;
    this.users = selection.items;
    this.selected = this.users;
    this._onUserSelectionChanged(this.selected);

    redraw();
  }

  public selectAll() {
    this.selected = this.users;
    this._onUserSelectionChanged(this.selected);
    redraw();
  }

  public unselectAll() {
    this.selected = [];
    this._onUserSelectionChanged(this.selected);
    redraw();
  }

  public anySelected(): boolean {
    return this.selected.length > 0;
  }

  public allSelected(): boolean {
    return this.selected.length > 0 && this.selected.length == this.users.length;
  }

  public userRightClickSelected(user: IUser) {
    this._contextUser = user;
  }

  public sendSms() {
    if (this._contextUser && this._onSendSms) {
      this._onSendSms(this._contextUser);
    }
  }

  public sendEmail() {
    if (this._contextUser && this._onSendEmail) {
      this._onSendEmail(this._contextUser);
    }
  }

  public banUser() {
    if (this._contextUser && this._onBanUser) {
      this._onBanUser(this._contextUser);
    }
  }

  public view({ attrs }: Vnode<IUserTableAttrs>) {
    this._onRequestChange = attrs.onRequestChange;
    this._onUserSelectionChanged = attrs.onUserSelectionChanged;

    let needRefresh: boolean;

    if (this._channel !== attrs.channel) {
      this._channel = attrs.channel;
      needRefresh = true;
    }

    if (this._state !== attrs.state) {
      this._state = attrs.state;
      needRefresh = true;
    }

    if (this._day !== attrs.day) {
      this._day = attrs.day;
      needRefresh = true;
    }

    if (this.bannedOnly != attrs.banned) {
      this.bannedOnly = attrs.banned;
      needRefresh = true;
    }

    if (needRefresh) {
      this.refresh();
    }

    this._onSendSms = attrs.onSendSms;
    this._onSendEmail = attrs.onSendEmail;
    this._onBanUser = attrs.onBanUser;

    return template.call(this, attrs);
  }
}
