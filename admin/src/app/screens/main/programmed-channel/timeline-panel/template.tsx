import { TimelinePanel, ITimelinePanelAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { TimelinePanelHeader } from './header';
import { Timeline } from './timeline';
import { TimelineControls } from './timeline-controls';
import { ChannelType } from '../../../../../../../common/common';

export function template(this: TimelinePanel, { onsave, onseek }: ITimelinePanelAttrs) {
  return (
    <div class={styles.control}>
      <TimelinePanelHeader channel={this.channel} onsave={onsave} />
      <Timeline
        timeline={this.channel.timeline}
        ref={this.timelineReadyHandler.bind(this)}
        onsave={onsave}
        onseek={onseek}
        readonly={this.channel.online}
      />
      {(!this.channel.online || this.channel.synced || this.channel.type == ChannelType.TIMELINE) && (
        <TimelineControls
          playing={this.isPlaying}
          onnext={this.buttonNextHandler.bind(this)}
          onprev={this.buttonPrevHandler.bind(this)}
          ontoggleplay={this.buttonTogglePlayHandler.bind(this)}
        />
      )}
    </div>
  );
}
