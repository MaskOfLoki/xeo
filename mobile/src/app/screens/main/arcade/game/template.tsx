import m from 'mithril';
import cn from 'classnames';

import styles from './module.scss';
import { ArcadeGameScreen } from '.';

export function template(this: ArcadeGameScreen) {
  return (
    <div class={cn(styles.screen, { [styles.hasChannelVideo]: this.hasChannelVideo })}>
      <iframe class={styles.integration_frame} src={this.url}></iframe>
    </div>
  );
}
