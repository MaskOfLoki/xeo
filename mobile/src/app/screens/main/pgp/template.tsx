import m from 'mithril';

import { PGPScreen } from '.';
import styles from './module.scss';

export function template(this: PGPScreen) {
  return (
    <div class={styles.screen}>
      <iframe class={styles.integration_frame} src={this.url}></iframe>
    </div>
  );
}
