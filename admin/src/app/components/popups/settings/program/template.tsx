import { ProgramSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { ConfigRadioToggle } from '../../../config-toggle';
import { IChannel } from '../../../../../../../common/common';
import { ConfigTextArea } from '../../../config-textarea';
import { ConfigFileUpload } from '../../../config-file-upload';
import { DEFAULT_CONFIG } from '../../../../../../../common/common';

export function template(this: ProgramSettings, channel: IChannel) {
  return (
    <div class={styles.container}>
      <div class={styles.mainPanel}>
        <div class={styles.programLabel}>Program Mode</div>
        <div class={styles.panel}>
          <div class={styles.replayPanel}>
            <div class={styles.row}>
              <div class={styles.configSlider}>
                <ConfigRadioToggle
                  class={styles.configSlide}
                  value='replay'
                  configField='program.mode'
                  namespace={channel?.id}
                />
                <div class={styles.sliderLabel}>Replay</div>
              </div>
            </div>
            <div class={styles.row}>
              <ConfigTextArea
                placeholder='Message'
                configField='program.replay.message'
                defaultValue={DEFAULT_CONFIG.program.replay.message}
                maxlength='120'
                namespace={channel?.id}
              />
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Logo</div>
              <div class={styles.image}>
                <ConfigFileUpload type='image' configField='program.replay.logo' namespace={channel?.id} />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Background</div>
              <div class={styles.image}>
                <ConfigFileUpload type='image' configField='program.replay.background' namespace={channel?.id} />
              </div>
            </div>
          </div>
          <div class={styles.tyPanel}>
            <div class={styles.row}>
              <div class={styles.configSlider}>
                <ConfigRadioToggle
                  class={styles.configSlide}
                  value='thankyou'
                  configField='program.mode'
                  namespace={channel?.id}
                />
                <div class={styles.sliderLabel}>Thank you</div>
              </div>
            </div>
            <div class={styles.row}>
              <ConfigTextArea
                placeholder='Message'
                configField='program.thankyou.message'
                defaultValue={DEFAULT_CONFIG.program.thankyou.message}
                maxlength='120'
                namespace={channel?.id}
              />
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Logo</div>
              <div class={styles.image}>
                <ConfigFileUpload type='image' configField='program.thankyou.logo' namespace={channel?.id} />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Background</div>
              <div class={styles.image}>
                <ConfigFileUpload type='image' configField='program.thankyou.background' namespace={channel?.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
