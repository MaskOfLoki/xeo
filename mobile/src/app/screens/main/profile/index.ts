import { template } from './template';
import { ClassBaseComponent } from '../../../components/class-base';
import { IFriendsGroup, IUser } from '../../../../../../common/common';
import { api } from '../../../services/api';
import { redraw } from 'mithril';
import { PopupManager } from '../../../../../../common/popups/PopupManager';
import { TeamCodePopup } from '../../../popups/team-code';
import { NotificationPopup } from '../../../popups/notification-popup';
import Swal from 'sweetalert2';

export class ProfileScreen extends ClassBaseComponent {
  public user: IUser;
  public friends = 0;
  public friendsGroup: IFriendsGroup;
  public loaded: boolean;

  protected teamName: string | null = null;

  constructor() {
    super();
    this._subscriptions.push(api.user.subscribe(this.userHandler.bind(this)));
  }

  private userHandler(value: IUser) {
    this.user = value;
    this.refreshGroups();
  }

  private async refreshGroups() {
    this.friendsGroup = await api.userGroups.getFriendsGroup();
    this.teamName = (await api.userGroups.getTeam())?.name;
    this.friends = this.friendsGroup?.totalUsers ?? 0;
    this.loaded = true;
    redraw();
  }

  public async buttonInviteFriendsHandler() {
    let url: string = location.href.split('#')[0];

    if (url.includes('?')) {
      url += '&';
    } else {
      if (!url.endsWith('/')) {
        url += '/';
      }

      url += '?';
    }

    const code = await api.userGroups.getFriendsGroupCode();

    url += `joinFriendsGroup=${code}`;

    Swal.fire({
      text: 'Use the link below to add Friends to your group.',
      input: 'text',
      inputValue: url,
      confirmButtonText: 'COPY',
      preConfirm: () => {
        const input: HTMLInputElement = Swal.getContent().querySelector('input');
        input.select();
        document.execCommand('copy');
      },
    });
  }

  public async buttonLeaveFriendsGroupHandler() {
    const result = await Swal.fire({
      text: 'Are you sure you want to leave Friends group',
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    await api.userGroups.leaveFriendsGroup();
    this.refreshGroups();
  }

  public onremove() {
    this._subscriptions.forEach((item) => item.unsubscribe());
  }

  public view() {
    return template.call(this);
  }

  protected async onJoinTeam() {
    const pinCode: string | undefined = await PopupManager.show(TeamCodePopup);
    if (pinCode) {
      const team = await api.userGroups.joinTeamByPin(this.channelId, pinCode, {
        avatar: this.user.avatar,
        username: this.user.username,
      });
      if (team) {
        this.teamName = team;

        const messageLines = [
          `Congratulations, you’ve successfully joined `,
          `Team “${this.teamName}”!`,
          '',
          '',
          `Check your Team leaderboard to see where you stand with your friends, and use the Team chatroom to chat with everyone.`,
        ];

        await PopupManager.show(NotificationPopup, { messageLines: messageLines });

        redraw();
      } else {
        const message = "Sorry, that's not a valid code";
        PopupManager.show(NotificationPopup, { message: message });
      }
    }
  }
}
