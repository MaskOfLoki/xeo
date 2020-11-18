import { TimelinePreviewsHeader } from './index';
import styles from './module.scss';
import m from 'mithril';

export function template(this: TimelinePreviewsHeader) {
  return (
    <div class={styles.control}>
      <div class={styles.title}>PREVIEWS</div>
    </div>
  );
}
