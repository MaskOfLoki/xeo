import { Timeline } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';

export function template(this: Timeline) {
  return (
    <div class={styles.control}>
      <div class={styles.tab}></div>
      <div class={cn(styles.timeline_container, { [styles.readOnly]: this.readOnly })}>
        <div class={styles.timer_marker}></div>
        <div class={styles.timer_label}></div>
      </div>
      <div class={styles.zoom_slider}></div>
    </div>
  );
}
