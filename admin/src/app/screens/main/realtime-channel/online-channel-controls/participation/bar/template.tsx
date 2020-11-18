import styles from './module.scss';
import m from 'mithril';
import { IParticipationBar } from '..';
import cn from 'classnames';

export function template({ label, percentage, amount, top }: IParticipationBar) {
  return (
    <div class={cn(styles.control, { [styles.top]: top })}>
      <div class={styles.label}>{label}</div>
      {percentage != undefined && (
        <div class={styles.bar}>
          {percentage > 0 && <div class={styles.fill} style={{ width: `${percentage}%` }}></div>}
        </div>
      )}
      {percentage != undefined && <div class={styles.percentage}>{percentage}%</div>}
      <div class={styles.amount}>{amount}</div>
    </div>
  );
}
