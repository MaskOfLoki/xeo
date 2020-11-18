import m from 'mithril';
import styles from './module.scss';
import { SendEmailPopup } from './index';
import { TextArea } from '../../../../../textarea';
import { Input } from '../../../../../input';
import { FileUpload } from '../../../../../file-upload';
import { MAX_EMAIL_SUBJECT_LENGTH } from '../../../../../../../common/constants';

export function template(this: SendEmailPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.headerText}>
        <div class={styles.headerTitle}>SEND EMAIL</div>
        <div class={styles.closeButton} onclick={() => this.close()} />
      </div>
      <div class={styles.mainContainer}>
        <div class={styles.title}>{this.recipients.length} RECIPIENTS SELECTED</div>
        <div class={styles.subjectInput}>
          <div class={styles.label}>Subject</div>
          <Input
            value={this.subject}
            maxlength={MAX_EMAIL_SUBJECT_LENGTH}
            oninput={(e) => (this.subject = e.target.value)}
          />
        </div>
        <div class={styles.imageAttachment}>
          <div class={styles.label}>Image Attachment</div>
          <div class={styles.imageRow}>
            <FileUpload value={this.footerImageUrl} onchange={(value) => this.addImage(value)} />
            <div class={styles.imageLabel}>
              UPLOAD IMAGE
              <div class={styles.imageSubLabel}>00 * 00 pixels</div>
            </div>
          </div>
        </div>
        <div class={styles.messageInput}>
          <div class={styles.label}>Message</div>
          <TextArea value={this.htmlBody} oninput={(e) => (this.htmlBody = e.target.value)} />
        </div>
      </div>
      <div class={styles.controls}>
        <button class={styles.confirm} onclick={this.buttonConfirmHandler.bind(this)}>
          SEND EMAIL
        </button>
      </div>
    </div>
  );
}
