import m from 'mithril';
import cn from 'classnames';
import { Sidemenu, ISidemenuAttrs } from './index';
import styles from './module.scss';

export function template(this: Sidemenu, { options, selectedItem, onItemSelect }: ISidemenuAttrs) {
  const i = options.findIndex((opt) => opt.key === selectedItem);

  return (
    <div class={styles.sidemenu}>
      {options.map((opt) => (
        <div
          class={cn(styles.menuitem, { [styles.selected]: opt.key === selectedItem })}
          onclick={() => onItemSelect(opt.key)}
        >
          {opt.label}
        </div>
      ))}
      {i >= 0 && <div class={styles.rightBar} style={{ top: i * 3 + 'rem' }} />}
    </div>
  );
}
