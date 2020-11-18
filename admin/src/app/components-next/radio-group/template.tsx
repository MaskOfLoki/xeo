import m from 'mithril';
import cn from 'classnames';
import { IRadioGroupAttrs, RadioGroup } from './index';
import styles from './module.scss';

export function template(this: RadioGroup, { name, value, horizontal, onChange, options }: IRadioGroupAttrs) {
  return (
    <div class={cn(styles.radiogroup, { [styles.horizontal]: horizontal })}>
      {options.map((opt) => (
        <label class={cn(styles.radio, { [styles.checked]: opt.value === value })}>
          <span class={styles.radioInput}>
            <input
              type='radio'
              name={name}
              value={opt.value}
              checked={opt.value === value}
              oninput={(e) => onChange && onChange(opt.value)}
            />
            <span class={styles.radioControl}></span>
          </span>
          <span class={styles.radioLabel}>
            <span>{opt.label}</span>
            {opt.attachment && <span class={styles.radioAttachment}>{opt.attachment}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}
