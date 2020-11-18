import m from 'mithril';
import { CardPreview } from './index';
import styles from './module.scss';
import cn from 'classnames';
import { MobilePreview } from '../../mobile-preview';

export function template(this: CardPreview, attrs) {
  return (
    <div class={cn(styles.control)}>
      <div class={styles.cut}>
        <MobilePreview {...attrs} />
      </div>
    </div>
  );
}
