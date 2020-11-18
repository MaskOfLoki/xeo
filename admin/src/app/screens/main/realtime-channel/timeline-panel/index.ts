import { Vnode } from 'mithril';
import { VnodeDOM } from 'mithril';
import { template } from './template';
import { ITimeline, IState, ChannelType, ICard } from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import { ChannelStateComponent, IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';
import Swal from 'sweetalert2';
import { Timeline } from '../../programmed-channel/timeline-panel/timeline';

export interface ITimelinePanelAttrs extends IChannelStateAttrs {
  onclose: VoidFunction;
  onsave: VoidFunction;
  timeline: ITimeline;
  ref: (value: TimelinePanel) => void;
  startTime: number;
  minimum: boolean;
  onmiminum: (value: boolean) => void;
}

export class TimelinePanel extends ChannelStateComponent<ITimelinePanelAttrs> {
  private _timeline: Timeline;

  public timelineData: ITimeline;
  public isPlaying = false;
  public minimum = false;
  public onminimum: (value: boolean) => void;

  public oncreate({ attrs }: VnodeDOM<ITimelinePanelAttrs>) {
    if (attrs.ref) {
      attrs.ref(this);
    }

    if (attrs.onmiminum) {
      this.onminimum = attrs.onmiminum;
    }

    this.minimum = attrs.minimum;
  }

  public onChangeMinimumToggle() {
    this.minimum = !this.minimum;

    if (this.onminimum) {
      this.onminimum(this.minimum);
    }
  }

  protected stateHandler(value: IState) {
    if (!value.startTime) {
      if (this._timeline) {
        this._timeline.togglePlay(false);
        this._timeline.goToStart();
      }
    } else if (this._state?.sid !== value.sid) {
      setTimeout(this.invalidateTimeline.bind(this), 200);
    }

    super.stateHandler(value);
  }

  public timelineReadyHandler(value: Timeline): void {
    this._timeline = value;
    this.invalidateTimeline();
  }

  private invalidateTimeline() {
    if (!this._timeline || !this._state?.channel) {
      return;
    }

    if (this._state.channel.type === ChannelType.MANUAL || (this._state.channel.synced && !this._state.pausedTime)) {
      this.isPlaying = true;
    }

    this._timeline.togglePlay(this.isPlaying);

    setTimeout(() => {
      let position: number;

      if (this._state.pausedTime) {
        position = this._state.pausedTime - this._state.startTime;
      } else {
        position = api.time() - this._state.startTime;
      }

      this._timeline.seek(position, {
        animation: false,
        emit: true,
      });
    }, 200);
  }

  public buttonTogglePlayHandler() {
    this.isPlaying = !this.isPlaying;
    this._timeline.togglePlay(this.isPlaying);
    api.toggleChannelPlay(this.isPlaying, this._channelId);
  }

  public buttonNextCardHandler() {
    const card: ICard = this._timeline.getNextItem()?.card;

    if (!card) {
      return;
    }

    api.seekProgrammedChannel(this.channel.id, card.startTime);
    this._timeline.goToNext();
  }

  public async buttonPrevCardHandler() {
    const card: ICard = this._timeline.getPrevItem()?.card;

    if (!card) {
      return;
    }

    const result = await Swal.fire({
      text: 'Are you sure you want to go to previous card? It will reset current progress',
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    const position: number = this._timeline.position;
    const prevCards: ICard[] = this.channel.timeline.cards.filter(
      (item) => item.startTime > card.startTime && item.startTime <= position,
    );
    prevCards.push(card);
    await Promise.all(prevCards.map((item) => api.wipeCardParticipation(item.id, this.channel.id)));
    api.seekProgrammedChannel(this.channel.id, card.startTime);

    while (card.id !== this._timeline.getCurrentItem()?.card?.id) {
      this._timeline.goToPrev();
    }
  }

  public view({ attrs }: Vnode<ITimelinePanelAttrs>) {
    return template.call(this, attrs);
  }

  public get startTime(): number {
    return this._state?.startTime;
  }
}
