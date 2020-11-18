import { VimeoPlayer } from '.';
import m from 'mithril';
import styles from './module.scss';

export function template(this: VimeoPlayer) {
  return <div class={styles.player}></div>;
}
