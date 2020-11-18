import m from 'mithril';
import cn from 'classnames';
import { XCNotificationButton } from '.';

import styles from './module.scss';

export function template(this: XCNotificationButton) {
  return (
    <div
      class={cn(styles.notificationButton, this.classes, { [styles.show]: this.show, [styles.shrink]: this.shrink })}
      onclick={this.onClick.bind(this)}
    >
      <div
        class={styles.icon}
        style={{
          'mask-image': `url(${this.icon})`,
          '-webkit-mask-image': `url(${this.icon})`,
        }}
      />
      <div class={styles.message}>ANSWER NOW</div>
    </div>
  );
}
