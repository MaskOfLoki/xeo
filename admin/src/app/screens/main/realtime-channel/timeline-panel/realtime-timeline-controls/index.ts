import { redraw } from 'mithril';
import { template } from './template';
import { ChannelStateComponent, IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';
import { IState } from '../../../../../../../../common/common';
import { api } from '../../../../../services/api';
import Swal from 'sweetalert2';

type ITimelineControlsAttrs = IChannelStateAttrs;

export class RealtimeTimelineControls extends ChannelStateComponent<ITimelineControlsAttrs> {
  private _startTime: number;
  private _timerId: number;
  private _timer = 0;

  protected stateHandler(value: IState): void {
    super.stateHandler(value);
    this._startTime = value.startTime;

    if (this._startTime) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  private startTimer() {
    if (this._timerId) {
      return;
    }

    this.tickHandler();
  }

  private stopTimer() {
    if (!this._timerId) {
      return;
    }

    clearTimeout(this._timerId);
    this._timerId = undefined;
  }

  private tickHandler() {
    if (!this._startTime) {
      return;
    }

    this._timer = Math.round((api.time() - this._startTime) * 0.001);
    this._timerId = window.setTimeout(this.tickHandler.bind(this), 1000);
    redraw();
  }

  public buttonSaveHandler() {
    if (this.channel.timeline.cards.length === 0) {
      Swal.fire('Please add at least one card to the timeline before saving');
      return;
    }

    api.saveTimeline(this._channelId, this.channel.timeline);
  }

  public onremove() {
    super.onremove();
    this.stopTimer();
  }

  public view() {
    return template.call(this);
  }

  public get timerValue(): string {
    const hours = Math.floor(this._timer / 3600);
    const minutes = Math.floor((this._timer - 3600 * hours) / 60);
    const seconds = this._timer - 3600 * hours - 60 * minutes;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
}
