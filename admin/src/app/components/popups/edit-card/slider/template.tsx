import { EditSlider } from './index';
import styles from './module.scss';
import m from 'mithril';
import { QuickAddSlider } from '../../../quick-add/slider';

export function template(this: EditSlider) {
  return (
    <div class={styles.controlWrapper}>
      <div class={styles.quckAddColumn}>
        <QuickAddSlider
          card={this.card}
          onchange={this._onchange}
          ref={(value) => (this.quickAddComponent = value)}
          channel={this._channel}
        />
      </div>
    </div>
  );
}
