import { TimelinePanelHeader, ITimelineControlsAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';

export function template(this: TimelinePanelHeader, { style }: ITimelineControlsAttrs) {
  return (
    <div class={cn(styles.headerControl, style)}>
      <div class={styles.title}>TIMELINE</div>
      {!this.channel.online && (
        <div class={styles.groupMedia} onclick={this.buttonMediaHandler.bind(this)}>
          <div class={styles.icon}></div>
          MEDIA
        </div>
      )}
    </div>
  );
}
