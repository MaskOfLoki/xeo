import styles from './module.scss';
import { EmailSettings } from './index';
import m from 'mithril';
import { DEFAULT_CONFIG } from '../../../../../../../../common/common';
import { ConfigTextArea } from '../../../../config-textarea';
import { Input } from '../../../../input';
import { MAX_EMAIL_ADDRESS_LENGTH, MAX_EMAIL_SUBJECT_LENGTH } from '../../../../../../common/constants';
import { ConfigInput } from '../../../../config-input';

export function template(this: EmailSettings) {
  return (
    <div class={styles.container}>
      <div class={styles.title}>Email</div>
      <div class={styles.label}>Email default subject</div>
      <ConfigInput
        placeholder='Your subject here...'
        maxlength={MAX_EMAIL_SUBJECT_LENGTH}
        configField='email.defaultSubject'
        defaultValue={DEFAULT_CONFIG.email.defaultSubject}
      />
      <br />
      <div class={styles.label}>Email default html body</div>
      <ConfigTextArea
        placeholder='Your message here...'
        maxlength={8000}
        configField='email.defaultHtmlBody'
        defaultValue={DEFAULT_CONFIG.email.defaultHtmlBody}
      />
      <br />
      <div class={styles.label}>Test Email sending to address:</div>
      <div class={styles.emailAndButton}>
        <div class={styles.email}>
          <Input
            maxlength={MAX_EMAIL_ADDRESS_LENGTH}
            placeholder='address@domain.com...'
            value={this.emailRecipientToTest}
            type='email'
            oninput={(e) => (this.emailRecipientToTest = e.target.value)}
          />
        </div>
        <div class={styles.testButton}>
          <button onclick={this.testSendEmail.bind(this)}>Test Email</button>
        </div>
      </div>
    </div>
  );
}
