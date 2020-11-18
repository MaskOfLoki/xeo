import { QuickAddSlider } from './index';
import styles from './module.scss';
import m from 'mithril';
import { Input } from '../../input';
import { SLIDER_LABEL_LENGTH } from '../../../../../../common/constants/cards';

export function template(this: QuickAddSlider) {
  return (
    <div class={styles.control}>
      {this.card.labels.map((label, index) => (
        <div class={styles.cardRow}>
          <div class={styles.groupInputBox}>
            <div
              class={styles.icon}
              style={{
                backgroundImage: `url(assets/images/slider/${index}.png)`,
              }}
            />
            <div class={styles.percentLabel}>{100 - index * 25}% Label</div>
            <Input
              maxlength={SLIDER_LABEL_LENGTH}
              value={label.slice(0, SLIDER_LABEL_LENGTH)}
              oninput={(e) => {
                this.card.labels[index] = e.target.value;
                this._onchange && this._onchange();
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
