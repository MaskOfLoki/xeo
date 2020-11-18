import m from 'mithril';
import styles from './module.scss';
import { AwardPointsPopup } from './index';
import { Input } from '../../../../../input';
import { MAX_AWARD_POINTS_LENGTH } from '../../../../../../../common/constants';

export function template(this: AwardPointsPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.headerText}>
        <div class={styles.headerTitle}>AWARD POINTS</div>
        <div class={styles.closeButton} onclick={() => this.close()} />
      </div>
      <div class={styles.mainContainer}>
        <div class={styles.title}>{this.usercount} RECIPIENTS SELECTED</div>
        <div class={styles.messageInput}>
          <div class={styles.label}>Points</div>
          <Input
            value={this.points}
            maxlength={MAX_AWARD_POINTS_LENGTH}
            type='number'
            oninput={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                this.points = value;
              } else {
                e.target.value = this.points;
              }
            }}
          />
        </div>
      </div>
      <div class={styles.controls}>
        <button class={styles.confirm} onclick={this.buttonConfirmHandler.bind(this)}>
          AWARD POINTS
        </button>
      </div>
    </div>
  );
}
