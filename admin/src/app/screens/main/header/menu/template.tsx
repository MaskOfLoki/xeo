import m from 'mithril';
import { Menu } from './index';
import styles from './module.scss';

export function template(this: Menu) {
  return <div class={styles.control} onclick={this.clickHandler.bind(this)}></div>;
}
