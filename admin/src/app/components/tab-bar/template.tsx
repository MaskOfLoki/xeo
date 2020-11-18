import { ITabBarAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export function template({ tabs, selected, selectedIndex, onchange, label, button, onbutton }: ITabBarAttrs) {
  if (selectedIndex == null && selected) {
    selectedIndex = tabs.indexOf(selected);
  }

  return (
    <div class={styles.tabBar}>
      {!isEmptyString(label) && <div class={styles.label}>{label}</div>}
      {tabs.map((tab, index) => (
        <div class={cn(styles.tab, { [styles.selected]: selectedIndex === index })} onclick={() => onchange(index)}>
          {tab.label}
        </div>
      ))}
      {!isEmptyString(button) && (
        <div class={styles.tab} onclick={onbutton}>
          {button}
        </div>
      )}
    </div>
  );
}
