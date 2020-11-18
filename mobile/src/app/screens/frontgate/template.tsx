import m from 'mithril';

import { FrontGateScreen } from './index';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { config } from '../../services/ConfigService';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { PhoneCodeSelect } from './phone-code-select';
import styles from './module.scss';

export function template(this: FrontGateScreen) {
  return (
    <div class={styles.frontGate}>
      <div
        class={styles.gameLogo}
        style={{
          backgroundImage: config.home.images?.mainLogo ? `url(${config.home.images?.mainLogo})` : '',
        }}
      ></div>
      <div class={styles.introText}>{config.signup.message}</div>
      <PhoneCodeSelect country={this.country} onchange={(value) => (this.country = value)} />
      <div class={styles.groupPhone} id='groupPhone'>
        <span class={styles.inputLabel}>PHONE NUMBER</span>
        <div class={styles.row}>
          <div class={styles.phoneCode}>+{this.country[1]}</div>
          <Input type='text' placeholder='555-555-5555' readonly={this.isSubmitted} />
        </div>
      </div>
      <Button onclick={this.submitHandler.bind(this)} disabled={this.isSubmitted && this.timerResend > 0}>
        {!this.isSubmitted && 'NEXT'}
        {this.isSubmitted && this.timerResend > 0 && `RESEND CODE IN ${this.timerResend}s`}
        {this.isSubmitted && this.timerResend === 0 && 'RESEND CODE'}
      </Button>
      {this.isSubmitted && (
        <div class={styles.infoText}>You will be sent a text containing a code to verify this device.</div>
      )}
      {this.isSubmitted && (
        <div class={styles.groupCommon}>
          <span class={styles.inputLabel}>VERIFICATION CODE:</span>
          <Input type='text' oninput={(e) => (this.verificationCode = e.target.value)} />
        </div>
      )}
      {!isEmptyString(config.signup.terms) && (
        <a href={config.signup.terms} target='_blank'>
          Terms & Conditions
        </a>
      )}
      {this.isSubmitted && (
        <Button onclick={this.verifyHandler.bind(this)} disabled={isEmptyString(this.verificationCode)}>
          VERIFY
        </Button>
      )}
    </div>
  );
}
