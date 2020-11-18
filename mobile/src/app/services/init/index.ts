import { route } from 'mithril';
import { getQueryParam } from '../../../../../common/utils/query';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { api } from '../api';
import Swal from 'sweetalert2';

class InitService {
  public start(defaultRoute = '/home') {
    const friendsCode: string = getQueryParam('joinFriendsGroup');

    if (!isEmptyString(friendsCode)) {
      this.processFriendsCode(friendsCode, defaultRoute);
      return;
    }

    const teamCode: string = getQueryParam('teamCode');
    const channelId: string = getQueryParam('channel');

    if (!isEmptyString(teamCode)) {
      this.processTeamCode(teamCode, channelId);
      return;
    }

    route.set(defaultRoute);
  }

  private async processFriendsCode(value: string, defaultRoute: string) {
    try {
      await api.userGroups.joinFriendsGroup(value);
      Swal.fire({
        text: `Congratulations, you've successfully joined a Group! Check you're Group leaderboard to see where you stand with your friends.`,
      });
    } catch (e) {
      // TODO: implement error handling
    }

    route.set(defaultRoute);
  }

  private async processTeamCode(pinCode: string, channelId: string) {
    try {
      const teamName = await api.userGroups.joinTeamByPin(channelId, pinCode, {});
      Swal.fire({
        text: `Congratulations, you've successfully joined a team ${teamName}! Check you're Group leaderboard to see where you stand with your team.`,
      });
    } catch (e) {
      // TODO: implement error handling
    }

    //console.log("processTeamCode home");
    route.set('/home');
  }
}

export const initService: InitService = new InitService();
