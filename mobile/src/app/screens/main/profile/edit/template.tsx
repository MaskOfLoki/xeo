import m, { route } from 'mithril';

import { EditProfileScreen } from './index';
import { Button } from '../../../../components/button';
import { Input } from '../../../../components/input';
import { Avatar } from '../../../../components/avatar';
import styles from './module.scss';
import { MAX_USERNAME, MIN_USERNAME } from '../../../userinfo';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { config } from '../../../../services/ConfigService';
import cn from 'classnames';

export function template(this: EditProfileScreen) {
  return (
    <div class={cn(styles.profile, { [styles.hasChannelVideo]: this.hasChannelVideo })}>
      <div
        class={styles.header}
        style={{
          backgroundColor: config.home.colors.header,
        }}
      >
        Edit Profile
      </div>
      <div class={styles.avatarGroup} onclick={() => m.route.set('/profile/avatar-select')}>
        <Avatar />
        <div class={styles.buttonEdit} />
      </div>

      <div class={styles.groupInput}>
        <div class={styles.groupSaveInput}>
          <Input type='text' value={this.username} oninput={(e) => (this.username = e.target.value)} />
          <div class={styles.buttonEdit} />
        </div>
        <span
          class={styles.inputLabel}
          style={{
            color: config.home.colors.text,
          }}
        >
          Username ({MIN_USERNAME} to {MAX_USERNAME} characters)
        </span>
      </div>

      <div class={styles.groupInput}>
        <div class={styles.groupSaveInput}>
          <Input type='text' value={this.email} oninput={(e) => (this.email = e.target.value)} />
          <div class={styles.buttonEdit} />
        </div>
        <span class={styles.inputLabel}>Email</span>
      </div>

      {config.optIn.enabled && (
        <div class={styles.groupCheckbox}>
          <input
            type='checkbox'
            class={styles.inputCheckbox}
            id='inputCheckboxOptin'
            checked={this.userOptin}
            oninput={this.toggleOptin.bind(this)}
          />
          <label class={styles.inputLabel} for='inputCheckboxOptin'>
            {config.optIn.message}
          </label>
        </div>
      )}
      {this.isAdditionalInfoAvailable && (
        <Button onclick={() => m.route.set('/profile/additional-user-info')}>ADDITIONAL INFO</Button>
      )}
      {!isEmptyString(config.signup.terms) && (
        <a href={config.signup.terms} target='_blank'>
          Terms & Conditions
        </a>
      )}

      <div class={styles.homeImg} style={{ background: config.home?.colors?.levels?.[1] }} />

      <Button
        class={styles.groupSaveButton}
        disabled={!this.isSaveAvailable}
        onclick={this.buttonSaveHandler.bind(this)}
      >
        Save
      </Button>

      <div class={styles.groupHomeButton}>
        <div class={styles.buttonHomeCircle}>
          <div class={styles.buttonHome} outline={true} onclick={() => route.set('/profile')}></div>
        </div>
      </div>
    </div>
  );
}
