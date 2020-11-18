import { template } from './template';
import { ClassComponent, redraw, Vnode } from 'mithril';
import { ITeamConfig, ITeamPlayConfig } from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import { IChannelAttrs } from '../../../../screens/main/channels-panel/channel';
import { uuid } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';

export class TeamsSettings implements ClassComponent<IChannelAttrs> {
  protected teamPlay: ITeamPlayConfig = null;
  protected selectedTeamIndex = 0;
  private _channelId = '';

  public async oninit({ attrs }: Vnode<IChannelAttrs>) {
    this._channelId = attrs.channel?.id ?? '';
    this.teamPlay = await api.loadChannelTeamsConfig(this._channelId);
    redraw();
  }

  public view({ attrs }: Vnode<IChannelAttrs>) {
    return template.call(this);
  }

  private suggestNewTeamName(): string {
    const defaultPrefix = 'Team ';
    const defaultLookingNames = this.teamPlay.teams.map((t) => t.name).filter((s) => s.startsWith(defaultPrefix));

    for (let i = 0; i < 100; i++) {
      const suggestedName = defaultPrefix + i.toString();

      if (!defaultLookingNames.includes(suggestedName)) {
        return suggestedName;
      }
    }
    return uuid();
  }

  private static getRandomDigit(): string {
    return Math.floor(Math.random() * 10).toString();
  }

  private generatePin(excludeExisting: string[]): string {
    let result: string;
    do {
      const digits = [...Array(4).keys()].map(() => TeamsSettings.getRandomDigit());
      result = ''.concat(...digits);
    } while (excludeExisting.includes(result));

    return result;
  }

  private generateUrl(pinCode: string) {
    return GC_PRODUCTION
      ? window.location.href + `?channel=${this._channelId}&teamCode=${pinCode}`
      : `http://localhost:8081/?gcClientId=${api.cid}&channel=${this._channelId}&teamCode=${pinCode}`;
  }

  protected async onTeamAdd() {
    if (this.teamPlay.teams.length >= 25) {
      Swal.fire('We have limit of 25 teams.', '', 'warning');
      return;
    }

    const pin = this.generatePin(this.teamPlay.teams.map((t) => t.pin));
    const newTeam: ITeamConfig = {
      pin: pin,
      name: this.suggestNewTeamName(),
      url: this.generateUrl(pin),
      id: null,
    };

    this.teamPlay.teams.push(newTeam);

    // enable team play when first team added
    if (this.teamPlay.teams.length === 1) {
      this.teamPlay.enabled = true;
    }

    await this.save();
    this.selectedTeamIndex = this.teamPlay.teams.length - 1;
    redraw();
  }

  protected async onTeamUpdate(team: ITeamConfig) {
    this.teamPlay.teams[this.selectedTeamIndex] = team;
    await this.save();
    redraw();
  }

  private async save() {
    await api.saveChannelTeamsConfig(this._channelId, this.teamPlay);
  }

  protected async onTeamDelete(index: number) {
    const { value } = await Swal.fire({
      title: `Are you sure you want to delete team "${this.teamPlay.teams[index].name}"?`,
      showCancelButton: true,
    });

    if (value) {
      this.teamPlay.teams.splice(index, 1);
      if (this.teamPlay.teams.length === 0) {
        this.teamPlay.enabled = false;
      }

      await this.save();
      if (index == this.selectedTeamIndex && this.selectedTeamIndex > 0) {
        this.selectedTeamIndex--;
      }
      redraw();
    }
  }

  protected onTeamSelect(index: number) {
    this.selectedTeamIndex = index;
    redraw();
  }

  protected setEnabled(value: boolean) {
    this.teamPlay.enabled = value;
    this.save();
  }

  protected setMandatory(value: boolean) {
    this.teamPlay.mandatory = value;
    this.save();
  }
}
