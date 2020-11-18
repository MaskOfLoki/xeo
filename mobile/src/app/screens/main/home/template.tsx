import { HomeScreen } from './index';
import m, { Vnode } from 'mithril';
import styles from './module.scss';

export function template(this: HomeScreen, vnode: Vnode) {
  return (
    <div class={styles.screen}>
      <div class={styles.cardContainer}>{vnode.children && vnode.children[0]}</div>
    </div>
  );
}
