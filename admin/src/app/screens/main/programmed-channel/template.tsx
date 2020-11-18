import { ProgrammedChannel, IConfigScreenAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { CardsPanel } from '../../../components/cards-panel';
import { TimelinePreviews } from './timeline-previews';
import { TimelinePanel } from './timeline-panel';

export function template(this: ProgrammedChannel, { onsave }: IConfigScreenAttrs) {
  return (
    <div class={styles.screen}>
      <div class={styles.cardPanelTimeLinePreviewRow}>
        <CardsPanel
          channel={this.channel}
          ondragend={this.cardDragEndHandler.bind(this)}
          onsave={onsave}
          ondelete={this.onDeleteCard.bind(this)}
          disabled={this.channel.online}
        />
        <TimelinePreviews
          channel={this.channel}
          ref={(value) => (this.timelinePreviews = value)}
          onduration={this.mediaDurationChangeHandler.bind(this)}
        />
      </div>
      <TimelinePanel
        ref={(value) => (this.timelinePanel = value)}
        channel={this.channel}
        onsave={() => onsave(this.channel, false)}
        onseek={this.timelineSeekHandler.bind(this)}
        ontoggleplay={this.timelineTogglePlayHandler.bind(this)}
      />
    </div>
  );
}
