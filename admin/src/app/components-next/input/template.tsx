import m from 'mithril';
import cn from 'classnames';
import { IInputAttrs, Input } from './index';
import styles from './module.scss';

export function template(
  this: Input,
  { value, label, helperText, showRemaining, showClear, multiline, disabled, size }: IInputAttrs,
) {
  const bottomLabel = !!value || this.focused ? label : '';

  return (
    <div class={cn(styles.inputNew, { [styles.disabled]: disabled, [styles.small]: size === 'small' })}>
      {multiline ? (
        <textarea
          placeholder={this.focused ? '' : label}
          value={value}
          disabled={disabled}
          onfocus={() => (this.focused = true)}
          onblur={() => (this.focused = false)}
          oninput={(e) => this.inputChangeHandler(e.target.value)}
        />
      ) : (
        <input
          type={showClear ? 'search' : 'text'}
          placeholder={this.focused ? '' : label}
          value={value}
          disabled={disabled}
          onfocus={() => (this.focused = true)}
          onblur={() => (this.focused = false)}
          oninput={(e) => this.inputChangeHandler(e.target.value)}
        />
      )}
      <div class={styles.inputBorder} />
      <div class={styles.helperRow}>
        <div class={styles.helperText}>{bottomLabel}</div>
        {showRemaining && <div class={styles.remaining}>{this.remaining} remaining</div>}
      </div>
    </div>
  );
}
