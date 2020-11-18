import m from 'mithril';
import cn from 'classnames';
import { ICheckboxAttrs, Checkbox } from './index';
import styles from './module.scss';

export function template(this: Checkbox, { value, label, onChange }: ICheckboxAttrs) {
  return (
    <label class={cn(styles.checkbox, { [styles.checked]: value })}>
      <span class={styles.checkboxInput}>
        <input type='checkbox' checked={value} oninput={(e) => onChange && onChange(e.target.checked)} />
        <span class={styles.checkboxControl}></span>
      </span>
      <span class={styles.checkboxLabel}>{label}</span>
    </label>
  );
}
