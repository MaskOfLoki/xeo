import { OptinSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { DEFAULT_CONFIG } from '../../../../../../../../common/common';
import { ConfigSlide } from '../../../../config-slide';
import { ConfigTextArea } from '../../../../config-textarea';

export function template(this: OptinSettings, { channel }) {
  return (
    <div class={styles.control}>
      <div class={styles.title}>OPTIN</div>
      <div class={styles.configSlider}>
        <ConfigSlide
          class={styles.configSlide}
          configField='optin.enabled'
          default={DEFAULT_CONFIG.optin.enabled}
          namespace={channel?.id}
        />
        <div class={styles.sliderLabel}>Enabled</div>
      </div>
      <div class={styles.row}>
        <ConfigTextArea
          placeholder='OptIn Message'
          configField='optin.message'
          defaultValue={DEFAULT_CONFIG.optin.message}
          maxlength='120'
          namespace={channel?.id}
        />
      </div>
      <div class={styles.configSlider}>
        <ConfigSlide
          class={styles.configSlide}
          configField='optin.defaultChecked'
          default={DEFAULT_CONFIG.optin.defaultChecked}
          namespace={channel?.id}
        />
        <div class={styles.sliderLabel}>Checked by default</div>
      </div>
    </div>
  );
}
