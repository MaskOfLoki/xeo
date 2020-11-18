import m from 'mithril';

import { UserInfoScreen, MIN_USERNAME, MAX_USERNAME } from './index';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { config } from '../../services/ConfigService';
import styles from './module.scss';

export function template(this: UserInfoScreen) {
  return (
    <div class={styles.userInfo}>
      <div
        class={styles.gameLogo}
        style={{
          backgroundImage: config.home.images?.mainLogo ? `url(${config.home.images?.mainLogo})` : '',
        }}
      ></div>
      <div class={styles.introText}>Sign up to have your voice heard.</div>
      <div class={styles.groupCommon}>
        <span class={styles.inputLabel}>
          USERNAME ({MIN_USERNAME} to {MAX_USERNAME} characters)
        </span>
        <Input type='text' value={this.username} oninput={(e) => (this.username = e.target.value)} />
      </div>
      {!config.signup?.anonymous && (
        <div class={styles.groupCommon}>
          <span class={styles.inputLabel}>EMAIL ADDRESS</span>
          <Input type='text' value={this.email} oninput={(e) => (this.email = e.target.value)} />
        </div>
      )}
      <div class={styles.groupCheckbox}>
        <input
          type='checkbox'
          class={styles.inputCheckbox}
          id='inputCheckboxAge'
          checked={this.over13}
          oninput={() => (this.over13 = !this.over13)}
        />
        <label class={styles.inputLabel} for='inputCheckboxAge'>
          AGE VERIFICATION <br />I am at least 13 years old
        </label>
      </div>
      {!config.signup?.anonymous && config.optIn.enabled && (
        <div class={styles.groupCheckbox}>
          <input
            type='checkbox'
            class={styles.inputCheckbox}
            id='inputCheckboxOptin'
            checked={this.userOptin}
            oninput={() => (this.userOptin = !this.userOptin)}
          />
          <label class={styles.inputLabel} for='inputCheckboxAge'>
            {config.optIn.message}
          </label>
        </div>
      )}
      <Button onclick={this.buttonSaveHandler.bind(this)}>NEXT</Button>
    </div>
  );
}
