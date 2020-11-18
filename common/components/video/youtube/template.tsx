import { YoutubePlayer } from '.';
import m from 'mithril';
import styles from './module.scss';

export function template(this: YoutubePlayer) {
  return <div class={styles.player}></div>;
}
