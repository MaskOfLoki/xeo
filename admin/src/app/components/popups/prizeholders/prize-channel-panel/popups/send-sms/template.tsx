import m from 'mithril';
import styles from './module.scss';
import { SendSMSPopup } from './index';
import { TextArea } from '../../../../../textarea';
import { SMS_BODY_MAX_LENGTH } from '../../../../../../../common/constants';

export function template(this: SendSMSPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.headerText}>
        <div class={styles.headerTitle}>SEND SMS</div>
        <div class={styles.closeButton} onclick={() => this.close()} />
      </div>
      <div class={styles.mainContainer}>
        <div class={styles.title}>{this.numbers.length} RECIPIENTS SELECTED</div>
        <div class={styles.messageInput}>
          <div class={styles.label}>Message</div>
          <TextArea
            value={this.message}
            maxlength={SMS_BODY_MAX_LENGTH}
            oninput={(e) => (this.message = e.target.value)}
          />
        </div>
      </div>
      <div class={styles.controls}>
        <button class={styles.confirm} onclick={this.buttonConfirmHandler.bind(this)}>
          SEND SMS
        </button>
      </div>
    </div>
  );
}
