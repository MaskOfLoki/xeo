import { HomeSignUpSettings, DEFAULT_FIELDS } from './index';
import styles from './module.scss';
import m from 'mithril';
import { HomeSettingsPreview } from '../design/preview';
import cn from 'classnames';
import { ConfigInput } from '../../../config-input';
import { ConfigTextArea } from '../../../config-textarea';
import { MAX_HEADER } from '../../../../utils';
import { ConfigFileUpload } from '../../../config-file-upload';
import { ConfigSlide } from '../../../config-slide';
import { DEFAULT_CONFIG } from '../../../../../../../common/common';
import { Input } from '../../../input';
import { OptinSettings } from './optin-settings';
import { ConfigRadioToggle } from '../../../config-toggle';

export function template(this: HomeSignUpSettings, { channel }) {
  return (
    <div class={styles.container}>
      <div class={styles.mainPanel}>
        <div class={styles.mainContent}>
          <div class={styles.left}>
            <div class={styles.mainLabel}>HOME SCREEN</div>
            <div class={styles.row}>
              <ConfigInput
                placeholder='Headline'
                maxlength={MAX_HEADER}
                configField='home.message'
                namespace={channel?.id}
                defaultValue={DEFAULT_CONFIG.home.message}
              />
            </div>
            {/* <div class={styles.modeRow}>
              <div class={styles.rowText}></div>
              <div class={styles.image}>
                <button class={cn('outline', 'disabled', styles.previewBtn)} disabled></button>
              </div>
              <div class={styles.image}>
                <button class={cn('outline', 'disabled', styles.nonPreviewBtn)}></button>
              </div>
            </div> */}
            <div class={styles.screenSaverRow}>
              <div class={styles.rowText}>Screensaver</div>
              <div class={styles.image}>
                <ConfigFileUpload type='imageOrVideo' configField='home.wait.portrait' namespace={channel?.id} />
              </div>
              <div class={styles.image}>
                <ConfigFileUpload type='imageOrVideo' configField='home.wait.landscape' namespace={channel?.id} />
              </div>
            </div>
            <div class={styles.noEventMsg}>
              <div class={styles.label}>No event message</div>
              <ConfigTextArea
                placeholder="The event hasn't started yet. Check back later!"
                maxlength={80}
                configField='home.noEventMsg'
                namespace={channel?.id}
                defaultValue={DEFAULT_CONFIG.home.noEventMsg}
              />
            </div>
            {!channel && (
              <div class={styles.iconSetRow}>
                <div class={styles.rowHeader}>
                  <div class={styles.iconSetHeaderLabel}>ICON SETS</div>
                  <div class={styles.addIconSetBtn} onclick={this.buttonAddIconSetHandler.bind(this)}>
                    +
                  </div>
                </div>
                <div class={styles.iconSetLabel}>Active Icon Set</div>
                <div class={styles.activeIconSetSelectContainer}>
                  <select
                    class={styles.iconSetSelect}
                    onchange={this.changeActiveIconSet.bind(this)}
                    id='iconSetSelect'
                  >
                    {this.iconSets?.map((iconSet) => (
                      <option value={iconSet.id} selected={iconSet.id === this.activeIconSetId}>
                        {iconSet.name}
                      </option>
                    ))}
                  </select>
                  <div class={styles.activeIconEditControlContainer}>
                    {this.activeIconSetId !== 'default' && (
                      <div class={styles.iconSetEdit} onclick={this.buttonEditIconSetHandler.bind(this)}></div>
                    )}
                    {this.activeIconSetId !== 'default' && (
                      <div class={styles.iconSetDelete} onclick={this.buttonDeleteIconSetHandler.bind(this)}></div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div class={styles.defaultScreenRow}>
              <div class={styles.mainLabel}>HOME SCREEN DEFAULTS</div>
              <div class={styles.defaultScreenContainer}>
                <div class={styles.configSlider}>
                  <ConfigRadioToggle
                    class={styles.configSlide}
                    value='home'
                    configField='signup.defaultScreen'
                    namespace={channel?.id}
                  />
                  <div class={styles.sliderLabel}>Auto Home Screen</div>
                </div>
                <div class={styles.configSlider}>
                  <ConfigRadioToggle
                    class={styles.configSlide}
                    value='arcade'
                    configField='signup.defaultScreen'
                    namespace={channel?.id}
                  />
                  <div class={styles.sliderLabel}>Arcade Home Screen</div>
                </div>
                <div class={styles.configSlider}>
                  <ConfigRadioToggle
                    class={styles.configSlide}
                    value='chat'
                    configField='signup.defaultScreen'
                    namespace={channel?.id}
                  />
                  <div class={styles.sliderLabel}>Chat Home Screen</div>
                </div>
              </div>
            </div>
          </div>
          <div class={styles.middle}>
            <div class={styles.mainLabel}>SIGN-UP SCREEN</div>
            <div class={styles.row}>
              <ConfigInput
                placeholder='Sign up Message'
                configField='signup.message'
                defaultValue={DEFAULT_CONFIG.signup.message}
                maxlength='100'
                namespace={channel?.id}
              />
            </div>
            <div class={styles.termsLabel}>Terms & Condition</div>
            <div class={styles.row60}>
              <div class={styles.textWrapper}>
                <ConfigInput
                  configField='signup.terms'
                  type='url'
                  defaultValue={DEFAULT_CONFIG.signup.terms}
                  placeholder='https://example.com'
                  namespace={channel?.id}
                />
              </div>
            </div>
            <div class={styles.configSlider}>
              <ConfigSlide
                class={styles.configSlide}
                configField='signup.anonymous'
                default={DEFAULT_CONFIG.signup.anonymous}
                namespace={channel?.id}
              />
              <div class={styles.sliderLabel}>Anonymous Login</div>
            </div>
            <div class={styles.termsLabel}>
              <div class={styles.fieldLabel}>Fields (required)</div>
            </div>
            {DEFAULT_FIELDS.map((field) => (
              <div class={styles.row60}>
                <div class={styles.textWrapper}>
                  <Input value={field} readonly='true' namespace={channel?.id} />
                </div>
              </div>
            ))}
            {this.parentFields.map((field) => (
              <div class={styles.row60}>
                <div class={styles.textWrapper}>
                  <Input value={field.name} readonly='true' namespace={channel?.id} />
                </div>
              </div>
            ))}
            <div class={styles.termsLabel}>
              <div class={styles.fieldLabel}>Fields</div>
              <button class={cn('outline', styles.addFieldBtn)} onclick={this.buttonAddFieldHandler.bind(this)}>
                +
              </button>
            </div>
            {this.fields.map((field, index) => (
              <div class={styles.row60}>
                <div class={styles.textWrapper}>
                  <Input value={field.name} readonly='true' />
                </div>
                <button class={styles.buttonEdit} onclick={this.buttonEditFieldHandler.bind(this, index)} />
                <button class={styles.buttonDelete} onclick={this.buttonRemoveFieldHandler.bind(this, index)} />
              </div>
            ))}
          </div>
          <div class={styles.right}>
            <OptinSettings channel={channel} />

            <div class={styles.audioSplashRow}>
              <div class={styles.row}>
                <div class={`${styles.rowText} ${styles.large}`}>Audio Splashscreen</div>
              </div>
              <div class={styles.row}>
                <ConfigSlide configField='audioSplash.enabled' namespace={channel?.id} />
                <span class={styles.marginLeftSmall}>Enabled</span>
              </div>
              <div class={styles.row}>
                <ConfigTextArea
                  placeholder='Message'
                  configField='audioSplash.message'
                  defaultValue={DEFAULT_CONFIG.audioSplash.message}
                  maxlength='120'
                  namespace={channel?.id}
                />
              </div>
              <div class={styles.row}>
                <div class={styles.rowText}>Logo</div>
                <div class={styles.image}>
                  <ConfigFileUpload type='image' configField='audioSplash.logo' namespace={channel?.id} />
                </div>
              </div>
              <div class={styles.row}>
                <div class={styles.rowText}>Background</div>
                <div class={styles.image}>
                  <ConfigFileUpload type='image' configField='audioSplash.background' namespace={channel?.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class={styles.previewPanel}>
        <HomeSettingsPreview channel={channel} />
      </div>
    </div>
  );
}
