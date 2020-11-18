import { ClassComponent, VnodeDOM, Vnode } from 'mithril';
import { template } from './template';
import {
  Timeline as TL,
  DataSet,
  TimelineOptions,
  TimelineEventPropertiesResult,
  TimelineWindow,
} from 'vis-timeline/standalone';
import styles from './module.scss';
import { ICard, ITimeline, CardStatus, CardStopMode } from '../../../../../../../../common/common';
import { randInt, cloneObject, fixDate } from '@gamechangerinteractive/xc-backend/utils';
import { CardTypeDataFactory } from '../../../../../utils/CardTypeDataFactory';
import { api } from '../../../../../services/api';
import deepEqual from 'fast-deep-equal';
import { getCardColorNumber } from '../../../../../components/card/template';
import noUiSlider from 'nouislider';
import basicContext from 'basiccontext';

import 'nouislider/distribute/nouislider.css';
import { throttle } from '../../../../../../../../common/utils';
import cn from 'classnames';

const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const ZOOM_MIN = MINUTE;
const ZOOM_MAX = DAY;
const ZOOM_DEFAULT = HOUR;

export interface ITimelineAttrs {
  ref: (value: Timeline) => void;
  timeline: ITimeline;
  onsave: VoidFunction;
  onseek: (milliseconds: number) => void;
  readonly: boolean;
  startTime: number;
}

const MARKER_ID = 'custom-marker';

export class Timeline implements ClassComponent<ITimelineAttrs> {
  private _timeline: TL;
  private _timelineData: ITimeline;
  private _items: DataSet;
  private _onsave: VoidFunction;
  private _onseek: (milliseconds: number) => void;
  private _throttledSave: VoidFunction = throttle(this.save.bind(this), 50);
  private _isPlaying: boolean;
  private _lastFrameTime: number;
  private _animationFrameHandler: VoidFunction = this.animationFrameHandler.bind(this);
  private _readonly = false;
  private _element: HTMLElement;
  private _slider;
  private _timeMouseDown = 0;
  private _max: number;
  private _startTime: number;
  private _mouseUpProps: TimelineEventPropertiesResult;
  private _timeMouseUp: number;
  private _drawTimer;
  private _seekPosition = 0;

  public oncreate(vnode: VnodeDOM<ITimelineAttrs>) {
    this._onsave = vnode.attrs.onsave;
    this._element = vnode.dom as HTMLElement;
    this._readonly = vnode.attrs.readonly;
    this._items = new DataSet();
    this._startTime = vnode.attrs.startTime ?? 0;
    this.onbeforeupdate(vnode);

    const options: TimelineOptions = {
      min: 0,
      stack: false,
      editable: {
        add: !this._readonly,
        remove: !this._readonly,
        updateTime: true,
      },
      zoomMin: ZOOM_MIN,
      zoomMax: ZOOM_MAX,
      zoomable: true,
      snap: null,
      template: (item) => htmlForCard(item.card),
      format: {
        minorLabels: (date: any) => {
          if (this._startTime) {
            return getCurrentTimeLabel(this._startTime + date.toDate().getTime());
          } else {
            return getTimeLabel(date.toDate().getTime());
          }
        },
        majorLabels: () => '',
      },
      itemsAlwaysDraggable: {
        item: true,
        range: true,
      },
      showTooltips: false,
      onMoving: (item: ITimelineItem, callback) => {
        const itemLength = item.end - item.start;
        if (item.start < 0) {
          item.end = itemLength;
          item.start = 0;
        }
        if (!this._readonly && toTime(item.end) - toTime(item.start) >= 1000 && !this.isItemOverlapsOthers(item)) {
          this.snapToNeighbors(item);
          callback(item);
          this._throttledSave();
        } else {
          callback(null);
        }
      },
      onRemove: (item, callback) => {
        callback(item);
        this._throttledSave();
      },
      onMove: (item, callback) => {
        if (this._readonly) {
          callback(null);
          return;
        }

        callback(item);
        this._throttledSave();
      },
    };

    this._timeline = new TL(vnode.dom.querySelector(`.${styles.timeline_container}`), this._items, options);

    this._timeline.addCustomTime(0, MARKER_ID);
    this._timeline.setCustomTimeTitle('', MARKER_ID);

    setTimeout(() => {
      this.seek(this._seekPosition, {
        animation: false,
        emit: false,
      });
    }, 100);

    // set default visible window to 1 hour
    this._timeline.setWindow(0, HOUR, {
      animation: false,
    });

    this._slider = noUiSlider.create(this._element.querySelector(`.${styles.zoom_slider}`), {
      start: [ZOOM_DEFAULT],
      range: {
        min: [ZOOM_MIN],
        '50%': [ZOOM_DEFAULT],
        max: [ZOOM_MAX],
      },
    });

    this._slider.on('slide', this.slideHandler.bind(this));

    this._timeline.on('rangechange', this.rangeChangeHandler.bind(this));
    this._timeline.on('mouseDown', this.mouseDownHandler.bind(this));
    this._timeline.on('mouseUp', this.mouseUpHandler.bind(this));
    this._timeline.on('timechanged', this.timeChangedHandler.bind(this));
    this._timeline.on('contextmenu', this.contextMenuHandler.bind(this));

    if (vnode.attrs.ref) {
      vnode.attrs.ref(this);
    }

    this._drawTimer = setInterval(this.drawTimer.bind(this), 10);
  }

  public onbeforeupdate({ attrs }: Vnode<ITimelineAttrs>) {
    if (!this._timeline) {
      return;
    }

    if (
      this._items &&
      (this._timelineData !== attrs.timeline ||
        !deepEqual(this._timelineData, attrs.timeline) ||
        this._items.get().length !== attrs.timeline.cards.length)
    ) {
      this._timelineData = attrs.timeline;
      this._items.clear();
      this._items.add(this._timelineData.cards.map(this.cardToTimelineItem.bind(this)));
      this._seekPosition = 0;
    }

    if (
      this._timeline &&
      attrs.timeline.duration &&
      !isNaN(attrs.timeline.duration) &&
      this._max !== attrs.timeline.duration
    ) {
      this.seek(this._seekPosition, {
        animation: false,
        emit: false,
      });

      this._max = attrs.timeline.duration;

      const timelineWindow: TimelineWindow = this._timeline.getWindow();

      if (toTime(timelineWindow.end) > this._max) {
        this._timeline.setWindow(0, this._max, {
          animation: false,
        });
      }
    }

    this._readonly = attrs.readonly;
    const customTimes = this._timeline['customTimes'];
    const bar: HTMLElement = customTimes[customTimes?.length - 1]?.bar;

    if (!bar) {
      return;
    }

    if (this._readonly) {
      bar.style.pointerEvents = 'none';
    } else {
      bar.style.pointerEvents = '';
    }
  }

  private rangeChangeHandler(e: { byUser: boolean; start: Date; end: Date; event: Event }) {
    if (!e.byUser) {
      return;
    }

    const time = toTime(this._timeline.getCustomTime(MARKER_ID));
    const window = this._timeline.getWindow();
    const start = toTime(window.start);

    if (time < start) {
      this._timeline.setCustomTime(start, MARKER_ID);
    } else {
      let end = toTime(window.end);
      end -= (end - start) * 0.004;

      if (time > end) {
        this._timeline.setCustomTime(end, MARKER_ID);
      }
    }

    if (e.event.type !== 'panmove') {
      this._slider.set(toTime(e.end) - toTime(e.start));
    }
  }

  private slideHandler(e: string[]) {
    const value = parseInt(e[0]);
    const time = toTime(this._timeline.getCustomTime(MARKER_ID));
    const dif = Math.round(value * 0.5);
    let start = time - dif;
    let end = time + dif;

    if (start < 0) {
      end += -start;
      start = 0;
    }

    if (end > ZOOM_MAX) {
      end = ZOOM_MAX;
    }

    this._timeline.setWindow(start, end, {
      animation: false,
    });
  }

  public togglePlay(isPlaying: boolean) {
    if (this._isPlaying === isPlaying) {
      return;
    }

    this._isPlaying = isPlaying;

    if (isPlaying) {
      this._lastFrameTime = api.time();
      requestAnimationFrame(this._animationFrameHandler);
    }
  }

  private animationFrameHandler(): void {
    if (!this._isPlaying) {
      return;
    }

    const now = api.time();
    const time = toTime(this._timeline.getCustomTime(MARKER_ID)) + now - this._lastFrameTime;
    this.seek(time, {
      animation: false,
      emit: false,
    });

    this._lastFrameTime = now;
    this.fixCardContent();
    requestAnimationFrame(this._animationFrameHandler);
  }

  // to make card properly cut if it's out of screen
  // https://gcinteractive.atlassian.net/browse/XEO-846
  private fixCardContent() {
    const timelineItems: HTMLElement[] = Array.from(this._element.querySelectorAll('.vis-item-content'));

    for (const timelineItem of timelineItems) {
      const card: HTMLElement = timelineItem.querySelector(`.${styles.card}`);

      if (!card) {
        continue;
      }

      let transform: string = timelineItem.style.transform;

      if (transform && transform.startsWith('translateX')) {
        transform = transform.replace('translateX(', '').replace(')', '');
        card.style.transform = `translateX(-${transform})`;
      } else {
        card.style.transform = '';
      }
    }
  }

  private contextMenuHandler(props: TimelineEventPropertiesResult) {
    if (!props.item || this._readonly) {
      return;
    }

    props.event.preventDefault();
    basicContext.show(
      [
        {
          title: 'REMOVE',
          fn: this.itemRemoveHandler.bind(this, props.item),
        },
      ],
      props.event,
    );
  }

  private itemRemoveHandler(itemId: number) {
    this._items.remove(itemId);
    this._throttledSave();
  }

  private mouseDownHandler() {
    if (this._readonly) {
      return;
    }

    this._timeMouseDown = Date.now();
  }

  private mouseUpHandler(props: TimelineEventPropertiesResult) {
    if (this._readonly) {
      return;
    }

    this._mouseUpProps = props;
    this._timeMouseUp = Date.now();

    if (!props.time || (props.event as PointerEvent).button !== 0 || this._timeMouseUp - this._timeMouseDown > 200) {
      return;
    }

    const time = toTime(props.time);
    this.seek(time);
  }

  private timeChangedHandler(props: TimelineEventPropertiesResult) {
    if (this._readonly) {
      return;
    }

    const time = toTime(props.time);
    this.seek(Math.max(time, 0));
  }

  public addCardFromDragEvent(e: DragEvent, card: ICard) {
    card = cloneObject(card);
    let props: TimelineEventPropertiesResult = this._timeline.getEventProperties(e);

    if (isNaN(toTime(props.time)) && Date.now() - this._timeMouseUp < 200) {
      props = this._mouseUpProps;
    }

    if (isNaN(toTime(props.time))) {
      console.warn('Timeline.addCardFromDragEvent: invalid props.time');
      return;
    }

    let id: number;
    const ids: number[] = this._items.getIds();

    do {
      id = randInt(1000000000);
    } while (ids.includes(id));

    card.startTime = toTime(props.time);
    const { start, end } = this._timeline.getWindow();

    // by default dragged card take 10% of visible timeline
    if (card.stopMode == CardStopMode.MANUAL || card.stopMode == CardStopMode.CENSUS) {
      card.stopTimer = Math.round((toTime(end) - toTime(start)) * 0.1);
    }

    const item: ITimelineItem = this.cardToTimelineItem(card);

    const duration = item.end - item.start;
    const allItems = this._items.get();
    const endOverlapIndex = allItems.findIndex((_item) => _item.start <= item.end && _item.end > item.start);
    item.end = endOverlapIndex < 0 ? item.end : allItems[endOverlapIndex].start - 1;
    item.start = item.end - duration;
    if (endOverlapIndex > 0 && item.start <= allItems[endOverlapIndex - 1].end) {
      item.start = allItems[endOverlapIndex - 1].end + 1;
    }
    if (item.start >= item.end) {
      return;
    }

    if (card.stopMode === CardStopMode.AUTO) {
      item.end = item.start + duration;
      if (endOverlapIndex >= 0 && item.end >= allItems[endOverlapIndex].start) {
        const offset = item.end - allItems[endOverlapIndex].start + 1;
        for (let i = endOverlapIndex; i < allItems.length; i++) {
          allItems[i].start += offset;
          allItems[i].end += offset;
          this._items.update(allItems[i]);
        }
      }
    }

    this._items.add(item);
    this._throttledSave();
  }

  public onRemoveCard(card: ICard): void {
    const toremove = this._items
      .get({
        filter: (item) => {
          return item.card.id === card.id;
        },
      })
      .map((item) => item.id);
    toremove.forEach((id) => this.itemRemoveHandler(id));
  }

  private snapToNeighbors(value: ITimelineItem): void {
    const timelineWindow = this._timeline.getWindow();
    // snaping threshold depends on zoom level
    const threshold = Math.round((toTime(timelineWindow.end) - toTime(timelineWindow.start)) * 0.005);

    this._items.get().forEach((item: ITimelineItem) => {
      if (item.id === value.id) {
        return;
      }

      if (Math.abs(toTime(item.start) - toTime(value.end)) < threshold) {
        value.end = toTime(item.start) - 1;
      }

      if (Math.abs(toTime(item.end) - toTime(value.start)) < threshold) {
        value.start = toTime(item.end) + 1;
      }
    });
  }

  private isItemOverlapsOthers(value: ITimelineItem): boolean {
    return this._items.get().some((item: ITimelineItem) => {
      if (item.id === value.id) {
        return false;
      } else if (toTime(value.start) <= toTime(item.start)) {
        return toTime(value.end) >= toTime(item.start);
      } else {
        return toTime(value.start) <= toTime(item.end);
      }
    });
  }

  public goToEnd() {
    const range = this._timeline.getItemRange();
    this.seek(toTime(range.max));
  }

  public goToStart() {
    this.seek(0);
  }

  public goToNext() {
    const nextItem = this.getNextItem();

    if (nextItem) {
      this.seek(toTime(nextItem.start));
    }
  }

  public getNextItem(): ITimelineItem {
    let nextItem: ITimelineItem;
    const current: ITimelineItem = this.getCurrentItem();
    const items: ITimelineItem[] = this._items.get().sort((p1, p2) => p1.start - p2.start);

    if (current) {
      const index: number = items.findIndex((item) => item.id === current.id);

      if (index < items.length - 1) {
        nextItem = items[index + 1];
      }
    } else {
      const time = toTime(this._timeline.getCustomTime(MARKER_ID));

      for (const item of items) {
        if (toTime(item.start) >= time) {
          nextItem = item;
          break;
        }
      }
    }

    return nextItem;
  }

  public goToPrev() {
    const prevItem: ITimelineItem = this.getPrevItem();

    if (prevItem) {
      this.seek(toTime(prevItem.start));
    }
  }

  public getPrevItem(): ITimelineItem {
    let prevItem: ITimelineItem;
    const current: ITimelineItem = this.getCurrentItem();
    const items: ITimelineItem[] = this._items.get().sort((p1, p2) => p1.start - p2.start);

    if (current) {
      const index: number = items.findIndex((item) => item.id === current.id);

      if (index > 0) {
        prevItem = items[index - 1];
      }
    } else {
      const time = toTime(this._timeline.getCustomTime(MARKER_ID));
      items.reverse();

      for (const item of items) {
        if (toTime(item.end) <= time) {
          prevItem = item;
          break;
        }
      }
    }

    return prevItem;
  }

  public getCurrentItem(): ITimelineItem {
    const time: number = toTime(this._timeline.getCustomTime(MARKER_ID));
    const items: ITimelineItem[] = this._items.get();

    const offsetFromBase = 2000;

    for (const item of items) {
      if (toTime(item.start) - offsetFromBase <= time && toTime(item.end) + offsetFromBase >= time) {
        return item;
      }
    }
  }

  private save() {
    this._timelineData.cards = this._items
      .get()
      .sort((p1, p2) => p1.start - p2.start)
      .map(timelineItemToCard);

    this._onsave();
  }

  private cardToTimelineItem(card: ICard): ITimelineItem {
    let id: number;
    const ids: number[] = this._items.getIds();

    do {
      id = randInt(1000000000);
    } while (ids.includes(id));

    const classes = [`timelineCard${card.id}`, styles[`timelineItem${getCardColorNumber(card.type)}`]];

    if (card.status === CardStatus.LIVE && card.stopMode !== CardStopMode.AUTO && card.stopMode !== undefined) {
      classes.push(styles.faded);
    }

    const result: ITimelineItem = {
      id,
      content: card.name,
      start: card.startTime,
      editable: {
        updateGroup: false,
        remove: !this._readonly,
        updateTime: true,
      },
      className: cn(...classes),
      template: htmlForCard(card),
      card,
    };

    if (card.stopMode !== CardStopMode.AUTO && card.stopMode !== undefined && card.status === CardStatus.LIVE) {
      if (this._timeline) {
        const w: TimelineWindow = this._timeline.getWindow();
        const start = toTime(w.start);
        const end = toTime(w.end);

        // by default live manual and census cards take 30% of visible timeline
        result.end = card.startTime + Math.round((end - start) * 0.3);
        requestAnimationFrame(this.redrawNonAutoCard.bind(this));
      } else {
        result.end = card.startTime + 10 * 60 * 1000;
      }
    } else if (card.stopTimer) {
      result.end = card.startTime + card.stopTimer;
    } else {
      // something went wrong if you get here
      // it's required to specify end for timeline item, so if the card doesn't have defined stopTimer
      // we set end to +year, because manual and census cards has no defined end time. Than the card is stopped, end time is adjusted accordingly
      result.end = card.startTime + 365 * 24 * 60 * 60 * 1000;
    }

    return result;
  }

  public seek(
    milliseconds: number,
    options: {
      animation?: boolean;
      emit?: boolean;
    } = { animation: true, emit: true },
  ) {
    this._seekPosition = milliseconds;

    this._timeline.moveTo(milliseconds, {
      animation: options.animation,
    });

    if (this._timeline) {
      this._timeline.setCustomTime(milliseconds, MARKER_ID);
    }

    this.redrawNonAutoCard();

    if (options.emit && this._onseek) {
      this._onseek(milliseconds);
    }
  }

  public redrawNonAutoCard() {
    if (!this._readonly) {
      return;
    }

    const timelineItem: ITimelineItem = this._items.get().find((item) => item.card?.status === CardStatus.LIVE);
    const card: ICard = timelineItem?.card;

    if (!card || card.stopMode === CardStopMode.AUTO) {
      return;
    }

    const time = toTime(this._timeline.getCustomTime(MARKER_ID));
    const itemLength = toTime(timelineItem.end) - toTime(timelineItem.start);
    const dif = time - toTime(timelineItem.start);

    if (dif <= 0) {
      return;
    }

    const timelineItemElement: HTMLElement = this._element.querySelector(`.timelineCard${card.id}`);

    if (!timelineItemElement) {
      return;
    }

    const percentage = Math.round((dif * 100) / itemLength);

    if (percentage <= 70) {
      return;
    }

    let maskImage = '';

    if (percentage < 99) {
      maskImage = `linear-gradient(to right, rgba(0, 0, 0, 1), ${percentage}%, rgba(0, 0, 0, 0))`;
    } else {
      this._items.update({ id: timelineItem.id, end: time });
      timelineItemElement.classList.remove(styles.faded);
    }

    timelineItemElement.style['-webkit-mask-image'] = timelineItemElement.style.maskImage = maskImage;
  }

  public drawTimer() {
    const value = toTime(this._timeline.getCustomTime(MARKER_ID));

    const handleUI: HTMLDivElement = this._element.querySelector(`.custom-marker`);
    const timerMarkerUI: HTMLDivElement = this._element.querySelector(`.${styles.timer_marker}`);
    const timerLabelUI: HTMLDivElement = this._element.querySelector(`.${styles.timer_label}`);
    const timeStr = getTimeLabel(value);

    const timeLineContainer: HTMLDivElement = this._element.querySelector(`.${styles.timeline_container}`);
    if (value < 0 || (handleUI && (handleUI.offsetLeft < 0 || handleUI.offsetLeft > timeLineContainer.offsetWidth))) {
      timerMarkerUI.style.display = 'none';
      timerLabelUI.style.display = 'none';
      this._timeline.setCustomTime(0, MARKER_ID);
    } else {
      timerMarkerUI.style.display = 'block';
      timerLabelUI.style.display = 'flex';
    }

    if (handleUI) {
      timerMarkerUI.style.left = handleUI.offsetLeft - 7 + 'px';
      timerMarkerUI.style.top = handleUI.offsetTop - 8 + 'px';

      timerLabelUI.style.left = handleUI.offsetLeft - 35 + 'px';
      timerLabelUI.style.top = handleUI.offsetTop + handleUI.offsetHeight + 1 + 'px';
      timerLabelUI.innerHTML = timeStr;
    }
  }

  public onremove() {
    if (this._timeline) {
      this._timeline.destroy();
    }

    clearInterval(this._drawTimer);
    this._isPlaying = false;
  }

  public view({ attrs }: Vnode<ITimelineAttrs>) {
    this._onseek = attrs.onseek;
    return template.call(this);
  }

  public get readOnly(): boolean {
    return this._readonly;
  }

  public get position(): number {
    return toTime(this._timeline.getCustomTime(MARKER_ID));
  }
}

export interface ITimelineItem {
  id: number;
  start: number;
  end?: number;
  card: ICard;
  content: string;
  editable?: {
    updateGroup: boolean;
    remove: boolean;
    updateTime: boolean;
  };
  className: string;
  template: string;
}

function timelineItemToCard(item: ITimelineItem) {
  const result: ICard = item.card;
  result.startTime = toTime(item.start);
  result.stopTimer = toTime(item.end) - result.startTime;
  return result;
}

function toTime(value): number {
  if (typeof value === 'number') {
    return value;
  }

  return fixDate(value).getTime();
}

function htmlForCard(card: ICard): string {
  const typeData = CardTypeDataFactory.get(card.type);
  const icon = `url(assets/images/icons/${typeData.icon})`;

  return `<div class="${styles.card}">
            <div class="${styles.icon}" style="mask-image: ${icon}; -webkit-mask-image: ${icon}"></div>
            <div class="${styles.column}">
              <div class="${styles.title}">${typeData.subtitle || typeData.title}</div>
              <div class="${styles.subtitle}">${card.name}</div>
            </div>
          </div>`;
}

function getTimeLabel(time: number): string {
  time = time * 0.001;
  const hrs = Math.floor(time / 3600);
  const mins = Math.floor((time - hrs * 3600) / 60);
  const seconds = Math.floor(time - hrs * 3600 - mins * 60);
  const timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  return timeStr;
}

function getCurrentTimeLabel(time: number, withSeconds?: boolean): string {
  const date: Date = new Date(time);
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  let result = `${hours.toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  if (withSeconds) {
    result += `:${date.getSeconds().toString().padStart(2, '0')}`;
  }

  return `${result} ${ampm}`;
}
