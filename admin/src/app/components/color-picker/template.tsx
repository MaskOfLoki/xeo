import m from 'mithril';
import { ColorPicker } from './index';
import styles from './module.scss';

export function template(this: ColorPicker) {
  return (
    <div class={styles.colorPicker}>
      {this.label && <div class={styles.label}>{this.label}</div>}
      <div class={styles.picker} style={{ background: this.color }}>
        {this.candelete && (
          <div class={styles.clearColor} onclick={this.ondelete.bind(this)}>
            X
          </div>
        )}
      </div>
    </div>
  );
}
