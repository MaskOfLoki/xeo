import { IMiscSettings, MiscSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { RealTimeSettings } from './realtime-settings';
import { SmsSettings } from './sms';
import { EmailSettings } from './email';

export function template(this: MiscSettings, { channel }: IMiscSettings) {
  return (
    <div class={styles.mainContainer}>
      <div class={styles.realTimePanel}>
        <RealTimeSettings channel={channel} />
      </div>
      <div class={styles.smsAndEMail}>
        <div class={styles.smsPanel}>
          <SmsSettings />
        </div>
        <div class={styles.emailPanel}>
          <EmailSettings />
        </div>
      </div>
    </div>
  );
}
