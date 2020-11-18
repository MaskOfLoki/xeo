import m from 'mithril';
import cn from 'classnames';
import { FullScreenToggle, IFullScreenToggleAttrs } from './index';
import styles from './module.scss';

export function template(this: FullScreenToggle, { value, onChange }: IFullScreenToggleAttrs) {
  return (
    <div class={cn(styles.fullscreenToggle, { [styles.selected]: value })} onclick={() => onChange && onChange(!value)}>
      <div className={styles.fullscreenImage} />
      <div className={styles.fullscreenLabel}>
        <div>Full</div>
        <div class={styles.small}>Prompted</div>
      </div>
    </div>
  );
}
