import m from 'mithril';
import cn from 'classnames';
import { Select, ISelectAttrs } from './index';
import styles from './module.scss';

export function template(this: Select, { value, options, onChange, className }: ISelectAttrs) {
  return (
    <div class={cn(styles.select, className)}>
      <select onchange={(e) => onChange && onChange(options[e.target.selectedIndex].value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} selected={value === opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div class={styles.border} />
    </div>
  );
}
