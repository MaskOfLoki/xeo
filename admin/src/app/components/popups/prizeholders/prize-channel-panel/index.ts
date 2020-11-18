import { ClassComponent, redraw, Vnode } from 'mithril';
import { template } from './template';
import { api } from '../../../../services/api';
import { PopupManager } from '../../../../../../../common/popups/PopupManager';
import { RandomSelectPopup } from './popups/random-select';
import { AdvancedFilterPopup } from './popups/advanced-filter';
import { SendSMSPopup } from './popups/send-sms';
import { SendEmailPopup } from './popups/send-email';
import { AwardPointsPopup } from './popups/award-points';
import { ILeadersFilter, ILeadersRequest } from '../../../../utils';
import Swal from 'sweetalert2';
import { GAME_ID, IChannel, IState, IUser } from '../../../../../../../common/common';
import { isEmailValid } from '../../../../../../../common/utils';
import { UserTable } from './user-table';
import { BanUsersPopup } from './popups/ban-users';
import { BanUserPopup } from './popups/ban-user';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import basicContext from 'basiccontext';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import styles from './module.scss';
import { ViewKind } from '../index';
import { isValidFilter } from './target-filter/services';

export interface IPrizeChannelPanelAttrs {
  selected: boolean;
  channel: IChannel;
  onselect: (value: boolean) => void;
  onstatechange: (value: IState) => void;
  ondaychange: (value: Date) => void;
  onusersselect: (value: IUser[]) => void;
  viewKind: ViewKind;
  onRequestChange: (value: ILeadersRequest) => void;
  ref: (value: PrizeChannelPanel) => void;
}

export enum IActionType {
  TOGGLE_USER_BAN = 'banned_user',
  SEND_EMAIL = 'send_email',
  SEND_SMS = 'send_sms',
  AWARD_POINTS = 'award_points',
}

export enum ISelectType {
  SELECT_ALL = 'select_all',
  UNSELECT_ALL = 'unselect_all',
  SELECT_RANDOM = 'select_random',
}

export class PrizeChannelPanel implements ClassComponent<IPrizeChannelPanelAttrs> {
  public channel: IChannel;
  public selectedState: IState;
  public selectedDay: Date;
  public usersSelected: IUser[] = [];
  public userTable: UserTable;
  public viewKind: ViewKind;

  private _onusersselect: (value: IUser[]) => void;
  private _onstatechange: (value: IState) => void;
  private _ondaychange: (value: Date) => void;
  private _filters: ILeadersFilter[] = [];
  private _states: IState[] = [];
  private _element: HTMLElement;
  private _flatpickr: flatpickr.Instance;

  public oncreate({ dom, attrs }) {
    this._element = dom;
    attrs.ref && attrs.ref(this);
  }

  private async refresh() {
    this._states = await api.getStatesByChannel(this.channel.id);
    this._states.sort((s1, s2) => s2.startTime - s1.startTime);
    redraw();
  }

  public filtersChangeHandler(values: ILeadersFilter[]) {
    if (values.some((item) => !item)) {
      values = [];
    }

    this._filters = values.filter((value) => isValidFilter(value));
    this.userTable.updateFilters(this._filters);
  }

  protected userSelectionChangedHandler(users: IUser[]): void {
    this.usersSelected = users;
    this._onusersselect && this._onusersselect(users);
  }

  public buttonCalendarHandler(e: Event) {
    if (this.viewKind === ViewKind.DAILY) {
      this.destroyFlatpickr();
      this._flatpickr = flatpickr(this._element.querySelector(`.${styles.calendarBtn}`), {
        onClose: (selectedDates) => {
          this.selectedDay = selectedDates[0];
          this._ondaychange(this.selectedDay);
          redraw();
        },
      });

      this._flatpickr.open();
      return;
    }

    const items = [
      {
        title: 'OVERALL',
        fn: this.overallSelectHandler.bind(this),
      },
    ];
    basicContext.show(
      items.concat(
        this._states.map((state) => {
          return {
            title: formatDate(state.startTime),
            fn: this.stateSelectHandler.bind(this, state),
          };
        }),
      ),
      e,
    );
  }

  private overallSelectHandler() {
    this.selectedState = undefined;
    this._onstatechange && this._onstatechange(undefined);
    redraw();
  }

  private stateSelectHandler(value: IState) {
    this.selectedState = value;
    this._onstatechange && this._onstatechange(value);
    redraw();
  }

  public async buttonDeleteHandler() {
    if (this.selectedDay) {
      this.selectedDay = undefined;
      this.refresh();
      return;
    }

    const result = await Swal.fire({
      title: `Are you sure you want to delete ${this.channel.name} - ${formatDate(this.selectedState.startTime)}?`,
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    await api.deleteState(this.selectedState);
    this.selectedState = undefined;
    this._onstatechange && this._onstatechange(undefined);
    this.refresh();
  }

  public actionChangeHandler(e) {
    const actionType: IActionType = e.target.value;

    switch (actionType) {
      case IActionType.TOGGLE_USER_BAN: {
        // noinspection JSIgnoredPromiseFromCall
        this.toggleBanForSelectedUsers();
        break;
      }
      case IActionType.SEND_EMAIL: {
        this.sendEmailToSelectedUsers();
        break;
      }
      case IActionType.SEND_SMS: {
        this.sendSmsToSelectedUsers();
        break;
      }
      case IActionType.AWARD_POINTS: {
        this.awardPointsToSelectedUsers();
        break;
      }
    }
  }

  private async awardPointsToSelectedUsers() {
    if (this.usersSelected.length === 0) {
      await Swal.fire({
        title: `AWARD POINTS`,
        html: `Please select at least one user to award points`,
      });
      return;
    }

    const result = await PopupManager.show(AwardPointsPopup, {
      leaderboard: this.selectedState ? this.selectedState.sid : 'overall',
      usersSelected: this.usersSelected,
    });

    if (result) {
      await this.userTable.refresh();
    }
  }

  public async sendSmsToUser(user: IUser) {
    if (isEmptyString(user.phone)) {
      await Swal.fire({
        title: `SEND SMS`,
        html: `Selected user does not have phone number on record.`,
      });
      return;
    }

    await PopupManager.show(SendSMSPopup, { numbers: [user.phone] });
  }

  private async sendSmsToSelectedUsers() {
    const phonesNumbers = this.usersSelected.map((u) => u.phone);
    const validPhonesNumbers = phonesNumbers.filter((n) => !!n && n.length >= 10);

    if (validPhonesNumbers.length === 0) {
      Swal.fire({
        title: `SEND SMS`,
        html: `Please select at least one user with valid phone number to send SMS to.`,
      });
      return;
    }

    if (validPhonesNumbers.length < phonesNumbers.length) {
      const confirmation = await Swal.fire({
        title: `SEND SMS`,
        html: `You have selected ${phonesNumbers.length} users but only ${validPhonesNumbers.length} of them have proper phone number. <p/> Do you want to send message to the users with valid numbers?`,
        confirmButtonText: 'SEND',
        showCancelButton: true,
      });

      if (confirmation.dismiss) {
        return;
      }
    }

    PopupManager.show(SendSMSPopup, { numbers: validPhonesNumbers });
  }

  public async sendEmailToUser(user: IUser) {
    if (isEmptyString(user.email)) {
      await Swal.fire({
        title: `SEND EMAIL`,
        html: `Selected user does not have email address on record.`,
      });
      return;
    }

    await PopupManager.show(SendEmailPopup, { recipients: [user.email] });
  }

  private async sendEmailToSelectedUsers() {
    const emails = this.usersSelected.map((u) => u.email);
    const validEmails = emails.filter((e) => isEmailValid(e));

    if (validEmails.length === 0) {
      Swal.fire({
        title: `SEND EMAIL`,
        html: `Please select at least one user with valid email address.`,
      });
      return;
    }

    if (validEmails.length < emails.length) {
      const confirmation = await Swal.fire({
        title: `SEND EMAIL`,
        html: `You have selected ${emails.length} users but only ${validEmails.length} of them have proper email address. <p/> Do you want to send message to the users with valid addresses?`,
        confirmButtonText: 'SEND',
        showCancelButton: true,
      });

      if (confirmation.dismiss) {
        return;
      }
    }

    PopupManager.show(SendEmailPopup, { recipients: validEmails });
  }

  private async toggleBanForSelectedUsers() {
    if (this.usersSelected.length === 0) {
      await Swal.fire({
        title: this.isBanView ? `UNBAN USER` : `BAN USER`,
        html: `Please select user(s) you want to ${this.isBanView ? 'unban' : 'ban'}.`,
      });
      return;
    }

    const result = await PopupManager.show(BanUsersPopup, {
      userCount: this.usersSelected.length,
      banOrUnban: !this.isBanView,
    });
    if (result) {
      if (this.isBanView) {
        await Promise.all(this.usersSelected.map((u) => api.unbanUser(u.uid, this.channel.name)));
      } else {
        await Promise.all(this.usersSelected.map((u) => api.banUser(u.uid, this.channel.name)));
      }
      await this.userTable.refresh();
    }
  }

  public async toggleUserBan(user: IUser) {
    const result = await PopupManager.show(BanUserPopup, { userToBan: user, banOrUnban: !this.isBanView });
    if (result) {
      if (this.isBanView) {
        await api.unbanUser(user.uid, this.channel.name);
      } else {
        await api.banUser(user.uid, this.channel.name);
      }
      await this.userTable.refresh();
    }
  }

  public async selectionChangeHandler(e) {
    const selectionType: ISelectType = e.target.value;

    switch (selectionType) {
      case ISelectType.SELECT_RANDOM:
        const selectCount = await PopupManager.show(RandomSelectPopup);

        if (selectCount && selectCount > 0) {
          this.userTable.selectRandomUsers(selectCount as number);
        }
        break;

      case ISelectType.SELECT_ALL:
        this.userTable.selectAll();
        break;

      case ISelectType.UNSELECT_ALL:
        this.userTable.unselectAll();
        break;
    }
  }

  public async advancedFilterHandler() {
    this._filters = await PopupManager.show(AdvancedFilterPopup, {
      filters: this._filters,
      channel: this.channel,
    });

    if (!this._filters) {
      this._filters = [];
    }

    this.userTable.updateFilters(this._filters);
  }

  private destroyFlatpickr() {
    if (this._flatpickr) {
      this._flatpickr.destroy();
      this._flatpickr = undefined;
    }
  }

  public async sendMainboardLeaders() {
    const result = await Swal.fire({
      title: 'Are you sure you want to replace leaders on mainboard with the selection below?',
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }
    await api.overrideMainboardLeaders(this.userTable.users, this.channel.id);
    this.refresh();
  }

  public onremove() {
    this.destroyFlatpickr();
  }

  public view({ attrs }: Vnode<IPrizeChannelPanelAttrs>) {
    this._onstatechange = attrs.onstatechange;
    this._onusersselect = attrs.onusersselect;
    this._ondaychange = attrs.ondaychange;

    if (this.channel !== attrs.channel) {
      this.channel = attrs.channel;
      this.refresh();
    }

    if (this.viewKind !== attrs.viewKind) {
      this.selectedState = undefined;
      this.selectedDay = undefined;

      this._onstatechange(undefined);
      this._ondaychange(undefined);

      this.viewKind = attrs.viewKind;
      this.destroyFlatpickr();
    }

    return template.call(this, attrs);
  }

  public get isBanView(): boolean {
    return this.viewKind == ViewKind.BANNED_USER;
  }
}

export function formatDate(time: number) {
  const date = new Date(time);
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
    .getDate()
    .toString()
    .padStart(2, '0')}/${date.getFullYear()} ${date
    .getHours()
    .toString()
    .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
