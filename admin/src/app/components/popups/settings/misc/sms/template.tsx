import styles from './module.scss';
import { SmsSettings } from './index';
import m from 'mithril';
import { DEFAULT_CONFIG } from '../../../../../../../../common/common';
import { ConfigTextArea } from '../../../../config-textarea';
import { Input } from '../../../../input';
import { MAX_PHONE_NUMBER_LENGTH, SMS_BODY_MAX_LENGTH } from '../../../../../../common/constants';

export function template(this: SmsSettings) {
  return (
    <div class={styles.container}>
      <div class={styles.title}>SMS</div>
      <div class={styles.label}>SMS default body</div>
      <ConfigTextArea
        placeholder='Your message here...'
        maxlength={SMS_BODY_MAX_LENGTH}
        configField='sms.defaultText'
        defaultValue={DEFAULT_CONFIG.sms.defaultText}
      />
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
          <button onclick={this.testSendSms.bind(this)}>Test SMS</button>
        </div>
      </div>
    </div>
  );
}
