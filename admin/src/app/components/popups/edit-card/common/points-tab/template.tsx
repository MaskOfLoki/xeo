import m from 'mithril';
import { Input } from '../../../../../components-next/input';
import styles from './module.scss';
import { IPointsTabAttrs, PointsTab } from './index';

export function template(this: PointsTab, { card }: IPointsTabAttrs) {
  return (
    <div class={styles.pointsTab}>
      <Input
        label='Points'
        value={card.points}
        onChange={(val) => {
          if (val !== '' && !Number(val)) {
            return;
          }
          card.points = val;
        }}
        max={5}
        showClear
      />
    </div>
  );
}
