import { Vnode } from 'mithril';
import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../../../../common/popups/PopupManager';
import Swal from 'sweetalert2';
import { IUser } from '../../../../../../../../../common/common';
import { api } from '../../../../../../services/api';
import { LeaderboardSettings } from '../../../../settings/leaderboard';

export interface IAwardUsersPopupAttrs extends IPopupAttrs {
  leaderboard: string;
  usersSelected: IUser[];
}

export class AwardPointsPopup extends PopupComponent<IAwardUsersPopupAttrs> {
  private _leaderboard: string;
  public usercount: number;
  public points: number;
  public usersSelected: IUser[];

  public oninit(vnode: Vnode<IAwardUsersPopupAttrs>) {
    super.oninit(vnode);
    this._leaderboard = vnode.attrs.leaderboard;
    this.usersSelected = vnode.attrs.usersSelected;
    this.usercount = this.usersSelected.length;
  }

  public async buttonConfirmHandler() {
    if (isNaN(this.points)) {
      await Swal.fire({
        title: `Please provide Points to send.`,
        showCancelButton: true,
      });
      return;
    }

    api.awardPointsToSelectedUsers(
      this.points,
      this.usersSelected.map((user) => user.uid),
      this._leaderboard,
    );

    this.close();
  }

  public view() {
    return template.call(this);
  }
}
