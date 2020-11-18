import { template } from './template';
import { ChannelStateComponent, IChannelStateAttrs } from '../../../utils/ChannelStateComponent';
import { VnodeDOM } from 'mithril';
import { TimelinePanel } from './timeline-panel';

export class RealtimeChannel extends ChannelStateComponent<IChannelStateAttrs> {
  public timelinePanel: TimelinePanel;
  public isMinimumTimeLine = false;

  public view({ attrs }: VnodeDOM<IChannelStateAttrs>) {
    return template.call(this, attrs);
  }

  public cardPlayHandler() {
    if (!this.timelinePanel.isPlaying) {
      this.timelinePanel.buttonTogglePlayHandler();
    }
  }
}
