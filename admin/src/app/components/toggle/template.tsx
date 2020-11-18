import m, { Vnode } from 'mithril';
import { Toggle } from './index';
import styles from './module.scss';
import cn from 'classnames';

export function template(this: Toggle, vnode: Vnode) {
  return (
    <div class={cn(styles.toggle, ...this.class.split(' '))} onclick={this.clickHandler.bind(this)}>
      <div
        class={styles.image}
        style={{ backgroundImage: `url(assets/images/toggle/${this.type}${this.selected ? '-selected' : ''}.svg)` }}
      />
      {vnode.children && <span>{vnode.children[0]}</span>}
    </div>
  );
}
