import m from 'mithril';

import { FeedBar } from './index';
import { config } from '../../../services/ConfigService';
import styles from './module.scss';
import cn from 'classnames';

export function template(this: FeedBar, attrs) {
  return (
    <div
      class={cn(styles.feedbar, attrs.class)}
      style={{ background: `${config.home.colors.levels[4]}80`, borderColor: config.home.colors.levels[2] }}
    >
      <div class={styles.logo} style={{ backgroundColor: config.home.colors.levels[1] }} />
      <div class={styles.actions} id='actions' />
    </div>
  );
}
