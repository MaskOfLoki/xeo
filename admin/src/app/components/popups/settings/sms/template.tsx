import styles from './module.scss';
import { SmsSettings } from './index';
import m from 'mithril';
import { TextArea } from '../../../textarea';
import { FileUpload } from '../../../file-upload';
import { Input } from '../../../input';
import { MAX_PHONE_NUMBER_LENGTH, SMS_BODY_MAX_LENGTH } from '../../../../../common/constants';

export function template(this: SmsSettings) {
  return (
    <div class={styles.container}>
      <div class={styles.title}>Send SMS</div>
      <div class={styles.users}>{this._users.length} RECEIPIENTS OPTED IN</div>
      <div class={styles.row}>
        <div class={styles.fill}>
          <div class={styles.label}>Message</div>
          <TextArea
            placeholder='Your message here...'
            maxlength={SMS_BODY_MAX_LENGTH}
            value={this._message}
            oninput={(e) => this.setMessage(e.target.value)}
          />
        </div>
        <div class={styles.upload}>
          <div class={styles.label}>Image Attachment</div>
          <div class={styles.row}>
            <FileUpload class={styles.uploadButton} value={this._image} onchange={this.setImage.bind(this)} />
            <div class={styles.fill}>
              <div class={styles.uploadImage}>Upload Image</div>
              <div class={styles.imageConstraints}>00 x 00 pixels</div>
            </div>
          </div>
        </div>
      </div>
      <div class={styles.sendButton}>
        <button onclick={this.sendSms.bind(this)}>SEND SMS</button>
      </div>
      <br />
      <br />
      <div class={styles.label}>Test SMS sending to phone number:</div>
      <div class={styles.phoneAndButton}>
        <div class={styles.phone}>
          <Input
            maxlength={MAX_PHONE_NUMBER_LENGTH}
            placeholder='number to send...'
            value={this.phoneNumberToTest}
            type='number'
            oninput={(e) => (this.phoneNumberToTest = e.target.value)}
          />
        </div>
        <div class={styles.testButton}>
          <button onclick={this.testSendSms.bind(this)}>SEND TEST SMS</button>
        </div>
      </div>
    </div>
  );
}
