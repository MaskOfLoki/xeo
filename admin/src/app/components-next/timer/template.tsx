import m from 'mithril';
import cn from 'classnames';
import { ITimerAttrs, Timer } from './index';
import styles from './module.scss';

export function template(this: Timer, { disabled, size }: ITimerAttrs) {
  return (
    <div class={cn(styles.timer, { [styles.disabled]: disabled, [styles.small]: size === 'small' })}>
      <div class={cn(styles.inputRow, { [styles.focused]: this.focused })}>
        <input
          class={styles.left}
          value={this.min}
          disabled={disabled}
          oninput={(e) => (this.min = e.target.value)}
          onfocus={() => (this.focused = true)}
          onblur={(e) => this.minChangeHandler(e.target.value)}
        />
        <span class={styles.separator}>:</span>
        <input
          value={this.sec}
          disabled={disabled}
          oninput={(e) => (this.sec = e.target.value)}
          onfocus={() => (this.focused = true)}
          onblur={(e) => this.secChangeHandler(e.target.value)}
        />
        <div class={styles.border}></div>
      </div>
      <div class={styles.clockIcon} />
    </div>
  );
}
