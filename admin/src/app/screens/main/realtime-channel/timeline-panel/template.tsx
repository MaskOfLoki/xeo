import { TimelinePanel, ITimelinePanelAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { ChannelType } from '../../../../../../../common/common';
import { RealtimeTimelineControls } from './realtime-timeline-controls';
import cn from 'classnames';
import { TimelinePanelHeader } from '../../programmed-channel/timeline-panel/header';
import { Timeline } from '../../programmed-channel/timeline-panel/timeline';

export function template(this: TimelinePanel, { onsave }: ITimelinePanelAttrs) {
  return (
    <div class={cn(styles.control, { [styles.minimumControl]: this.minimum })}>
      <div class={styles.header}>
        {this.channel?.type === ChannelType.MANUAL && this.channel?.online && (
          <div
            class={cn(styles.minimumBtn, { [styles.minimum]: this.minimum })}
            onclick={this.onChangeMinimumToggle.bind(this)}
          ></div>
        )}
      </div>
      <TimelinePanelHeader
        channel={this.channel}
        style={styles.headerPanel}
        playing={this.isPlaying}
        ontoggleplay={this.buttonTogglePlayHandler.bind(this)}
        onprevcard={this.buttonPrevCardHandler.bind(this)}
        onnextcard={this.buttonNextCardHandler.bind(this)}
        onsave={onsave}
      />
      {!this.minimum && this.channel && (
        <Timeline
          timeline={this.channel.timeline}
          readonly={true}
          ref={this.timelineReadyHandler.bind(this)}
          startTime={this.channel.type === ChannelType.MANUAL ? this.startTime : 0}
        />
      )}
      {this.channel?.type === ChannelType.MANUAL && <RealtimeTimelineControls channel={this.channel} />}
    </div>
  );
}
