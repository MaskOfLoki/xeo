import { RealtimeChannel } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { CardsPanel } from '../../../components/cards-panel';
import { TimelinePanel } from './timeline-panel';
import { OnlineChannelControls } from './online-channel-controls';

export function template(this: RealtimeChannel, { onsave }) {
  return (
    this.channel && (
      <div class={styles.screen}>
        <div class={cn(styles.cardTimeLineControl, { [styles.minimumTimeLine]: this.isMinimumTimeLine })}>
          <CardsPanel channel={this.channel} onsave={onsave} onplay={this.cardPlayHandler.bind(this)} />
          <TimelinePanel
            channel={this.channel}
            readonly={this.channel?.online}
            ref={(value) => (this.timelinePanel = value)}
            minimum={this.isMinimumTimeLine}
            onmiminum={(value) => (this.isMinimumTimeLine = value)}
            onsave={onsave}
          />
        </div>
        <OnlineChannelControls channel={this.channel} onsave={onsave} />
      </div>
    )
  );
}
