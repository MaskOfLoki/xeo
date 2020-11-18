import { template } from './template';
import { ICard, IChannel } from '../../../../../../common/common';
import { ChannelStateComponent, IChannelStateAttrs } from '../../../utils/ChannelStateComponent';
import { TimelinePanel } from './timeline-panel';
import { TimelinePreviews } from './timeline-previews';

export interface IConfigScreenAttrs extends IChannelStateAttrs {
  onsave: (value: IChannel, showProgress?: boolean) => void;
}

export class ProgrammedChannel extends ChannelStateComponent<IConfigScreenAttrs> {
  public timelinePanel: TimelinePanel;
  public timelinePreviews: TimelinePreviews;

  public timelineSeekHandler(value: number): void {
    if (this.timelinePreviews) {
      this.timelinePreviews.seek(value);
    }
  }

  public mediaDurationChangeHandler(value: number): void {
    this.timelinePanel.updateDuration(value);
  }

  public cardDragEndHandler(e: DragEvent, card: ICard) {
    if (this.timelinePanel) {
      this.timelinePanel.addCardFromDragEvent(e, card);
    }
  }

  public onDeleteCard(card: ICard): void {
    if (this.timelinePanel) {
      this.timelinePanel.onRemoveCard(card);
    }
  }

  public timelineTogglePlayHandler(value: boolean) {
    this.timelinePreviews.togglePlay(value);
  }

  public view({ attrs }) {
    return template.call(this, attrs);
  }
}
