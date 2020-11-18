import m from 'mithril';
import cn from 'classnames';
import { SplitToggle, ISplitToggleAttrs } from './index';
import styles from './module.scss';

export function template(this: SplitToggle, { value, onChange }: ISplitToggleAttrs) {
  return (
    <div class={cn(styles.splitToggle, { [styles.selected]: value })} onclick={() => onChange && onChange(!value)}>
      <div className={styles.splitLabel}>Split</div>
      <div className={styles.splitImage} />
    </div>
  );
}
