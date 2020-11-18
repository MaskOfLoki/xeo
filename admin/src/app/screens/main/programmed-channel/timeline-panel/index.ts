import { Vnode, VnodeDOM } from 'mithril';
import { template } from './template';
import { delay } from '../../../../../../../common/utils';
import styles from './module.scss';
import { ICard, IState } from '../../../../../../../common/common';
import { Timeline } from './timeline';
import { IChannelStateAttrs, ChannelStateComponent } from '../../../../utils/ChannelStateComponent';
import { api } from '../../../../services/api';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';

export interface ITimelinePanelAttrs extends IChannelStateAttrs {
  onsave: VoidFunction;
  onseek: (milliseconds: number) => void;
  ref: (value: TimelinePanel) => void;
  ontoggleplay: (value: boolean) => void;
  startTime: number;
}

export class TimelinePanel extends ChannelStateComponent<ITimelinePanelAttrs> {
  private _timeline: Timeline;
  private _onsave: VoidFunction;
  private _ontoggleplay: (value: boolean) => void;
  public isPlaying: boolean;

  public oncreate({ attrs }: VnodeDOM<ITimelinePanelAttrs>) {
    attrs.ref && attrs.ref(this);
  }

  public onbeforeremove(vnode: VnodeDOM) {
    if (!vnode.dom) {
      return;
    }

    vnode.dom.classList.add(styles.fadeOut);
    return delay(500);
  }

  public timelineReadyHandler(value: Timeline): void {
    this._timeline = value;
    this.invalidateTimeline();
  }

  protected stateHandler(value: IState): void {
    super.stateHandler(value);
    this.invalidateTimeline();
  }

  private invalidateTimeline() {
    if (!this._timeline) {
      return;
    }

    if (isEmptyString(this._state?.sid)) {
      this.isPlaying = false;
      this._timeline.togglePlay(false);
      this._timeline.seek(0);
      return;
    }

    if (this.channel.online && !this._state.pausedTime) {
      this.isPlaying = true;
    }

    this._timeline.togglePlay(this.isPlaying);
    this._ontoggleplay && this._ontoggleplay(this.isPlaying);

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

  public addCardFromDragEvent(e: DragEvent, card: ICard) {
    this._timeline.addCardFromDragEvent(e, card);
  }

  public onRemoveCard(card: ICard) {
    this._timeline.onRemoveCard(card);
  }

  public buttonStartHandler() {
    this._timeline.goToStart();
  }

  public buttonEndHandler() {
    this._timeline.goToEnd();
  }

  public buttonNextHandler() {
    if (!isEmptyString(this._state?.sid)) {
      const card: ICard = this._timeline.getNextItem()?.card;

      if (!card) {
        return;
      }

      api.seekProgrammedChannel(this.channel.id, card.startTime);
    }

    this._timeline.goToNext();
  }

  public async buttonPrevHandler() {
    if (isEmptyString(this._state?.sid)) {
      this._timeline.goToPrev();
      return;
    }

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
    this._timeline.seek(card.startTime);
  }

  public buttonTogglePlayHandler() {
    this.isPlaying = !this.isPlaying;
    this._ontoggleplay && this._ontoggleplay(this.isPlaying);

    if (!isEmptyString(this._state?.sid)) {
      api.toggleChannelPlay(this.isPlaying, this._channelId);
    } else {
      this._timeline.togglePlay(this.isPlaying);
    }
  }

  public updateDuration(value: number) {
    if (value <= 0 || this.channel.timeline.duration === value) {
      return;
    }

    this.channel.timeline.duration = value;
    this._onsave();
  }

  public togglePlay(value: boolean) {
    if (this.isPlaying === value) {
      return;
    }

    this.isPlaying = value;
    this._timeline.togglePlay(this.isPlaying);
  }

  public view({ attrs }: Vnode<ITimelinePanelAttrs>) {
    this._onsave = attrs.onsave;
    this._ontoggleplay = attrs.ontoggleplay;
    return template.call(this, attrs);
  }
}
