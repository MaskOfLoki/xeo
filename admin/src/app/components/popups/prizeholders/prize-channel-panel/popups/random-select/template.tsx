import m from 'mithril';
import styles from './module.scss';
import { RandomSelectPopup } from './index';
import { Input } from '../../../../../input';
import { MAX_RANDOM_LEADERS_SELECTED } from '../../../../../../../common/constants';

export function template(this: RandomSelectPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.headerText}>
        <div class={styles.headerTitle}>RANDOM SELECT AMOUNT</div>
        <div class={styles.closeButton} onclick={() => this.close()} />
      </div>
      <div class={styles.mainContainer}>
        <Input
          placeholder='Input Amount'
          type='number'
          min={1}
          max={MAX_RANDOM_LEADERS_SELECTED}
          value={this.selectCount}
          oninput={(e) => (this.selectCount = +e.target.value)}
        />
      </div>
      <div class={styles.controls}>
        <button class={styles.cancel} onclick={this.close.bind(this, undefined)}>
          CANCEL
        </button>
        <button class={styles.confirm} onclick={this.buttonConfirmHandler.bind(this)}>
          SELECT
        </button>
      </div>
    </div>
  );
}
