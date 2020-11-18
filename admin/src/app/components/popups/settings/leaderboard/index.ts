import { template } from './template';
import { redraw, Vnode } from 'mithril';
import { IGCLeader, IGCUser } from '@gamechangerinteractive/xc-backend';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { ChannelStateComponent, IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';
import { IState } from '../../../../../../../common/common';

export class LeaderboardSettings extends ChannelStateComponent<IChannelStateAttrs> {
  private _isOverall = true;

  private _sid: string;

  protected stateHandler(value: IState) {
    super.stateHandler(value);
    this._sid = value.sid;

    if (!this._isOverall && isEmptyString(this._sid)) {
      this._isOverall = true;
    }

    this.refresh();
  }

  private refresh() {
    const leaderboards: string[] = ['overall'];

    if (!isEmptyString(this._sid)) {
      leaderboards.push(this._sid);
    }

    redraw();
  }

  public overallChangeHandler(value: boolean) {
    this._isOverall = value;
  }

  public view({ attrs }: Vnode<IChannelStateAttrs>) {
    return template.call(this, attrs);
  }

  public get sid(): string {
    return this._sid;
  }
}
