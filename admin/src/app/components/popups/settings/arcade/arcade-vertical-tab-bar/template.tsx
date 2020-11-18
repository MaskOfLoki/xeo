import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { IArcadeVerticalTabBarAttrs, ArcadeVerticalTabBar } from './index';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export function template(
  this: ArcadeVerticalTabBar,
  { tabs, selected, selectedIndex, onchange, label }: IArcadeVerticalTabBarAttrs,
) {
  if (selectedIndex == null && selected) {
    selectedIndex = tabs.indexOf(selected);
  }

  return (
    <div class={styles.verticalTabBar}>
      {!isEmptyString(label) && <div class={styles.label}>{label}</div>}
      {tabs.map((tab, index) => (
        <button
          class={cn(styles.verticalTab, {
            selected: selectedIndex === index,
            outline: selectedIndex !== index,
            [styles.premium]: tab.premium,
            [styles.disabled]: !this.config.arcade?.[`enable-${tab.gid}`],
          })}
          onclick={() => onchange(index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
