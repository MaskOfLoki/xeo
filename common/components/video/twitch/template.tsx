import { TwitchPlayer } from '.';
import m from 'mithril';
import styles from './module.scss';

export function template(this: TwitchPlayer) {
  return <div class={styles.player}></div>;
}
