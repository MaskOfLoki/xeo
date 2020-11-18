import styles from './module.scss';
import m from 'mithril';
import { HomeSettingsPreview } from './preview';
import cn from 'classnames';
import { IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';
import { ConfigColorPicker } from '../../../config-color-picker';
import { DEFAULT_CONFIG } from '../../../../../../../common/common';
import { ConfigFileUpload } from '../../../config-file-upload';
import { GradientDisplay } from '../../../gradient-display';

export function template({ channel }: IChannelStateAttrs) {
  return (
    <div class={styles.container}>
      <div class={styles.mainPanel}>
        <div class={styles.cardDesignLabel}>CARD DESIGN</div>
        <div class={styles.mainContent}>
          <div class={styles.left}>
            <div class={styles.modeRow}></div>
            <div class={`${styles.row} ${styles.large}`}>
              <div class={styles.rowText}>Primary</div>
              <div class={styles.colorContainer}>
                <div class={`${styles.row} ${styles.colorRow}`}>
                  <div class={styles.color}>
                    <ConfigColorPicker
                      configField='home.colors.primary.foreground'
                      defaultColor={DEFAULT_CONFIG.home.colors.primary.foreground}
                      namespace={channel?.id}
                    />
                  </div>
                  <div class={styles.color}>
                    <ConfigColorPicker
                      configField='home.colors.primary.background'
                      defaultColor={DEFAULT_CONFIG.home.colors.primary.background}
                      namespace={channel?.id}
                    />
                  </div>
                </div>
                <div class={`${styles.row} ${styles.displayRow}`}>
                  <GradientDisplay
                    configField='home.colors.primary.foreground'
                    defaultLeftColor={DEFAULT_CONFIG.home.colors.primary.foreground}
                    secondaryConfigField='home.colors.primary.background'
                    defaultRightColor={DEFAULT_CONFIG.home.colors.primary.background}
                    namespace={channel?.id}
                  />
                </div>
              </div>
            </div>
            <div class={`${styles.row} ${styles.large}`}>
              <div class={styles.rowText}>Secondary</div>
              <div class={styles.colorContainer}>
                <div class={`${styles.row} ${styles.colorRow}`}>
                  <div class={styles.color}>
                    <ConfigColorPicker
                      configField='home.colors.secondary.foreground'
                      defaultColor={DEFAULT_CONFIG.home.colors.secondary.foreground}
                      namespace={channel?.id}
                    />
                  </div>
                  <div class={styles.color}>
                    <ConfigColorPicker
                      configField='home.colors.secondary.background'
                      defaultColor={DEFAULT_CONFIG.home.colors.secondary.background}
                      namespace={channel?.id}
                    />
                  </div>
                </div>
                <div class={`${styles.row} ${styles.displayRow}`}>
                  <GradientDisplay
                    configField='home.colors.secondary.foreground'
                    defaultLeftColor={DEFAULT_CONFIG.home.colors.secondary.foreground}
                    secondaryConfigField='home.colors.secondary.background'
                    defaultRightColor={DEFAULT_CONFIG.home.colors.secondary.background}
                    namespace={channel?.id}
                  />
                </div>
              </div>
            </div>
            <div class={`${styles.row} ${styles.large}`}>
              <div class={styles.rowText}>Tertiary</div>
              <div class={styles.colorContainer}>
                <div class={`${styles.row} ${styles.colorRow}`}>
                  <div class={styles.color}>
                    <ConfigColorPicker
                      configField='home.colors.tertiary.foreground'
                      defaultColor={DEFAULT_CONFIG.home.colors.tertiary.foreground}
                      namespace={channel?.id}
                    />
                  </div>
                  <div class={styles.color}>
                    <ConfigColorPicker
                      configField='home.colors.tertiary.background'
                      defaultColor={DEFAULT_CONFIG.home.colors.tertiary.background}
                      namespace={channel?.id}
                    />
                  </div>
                </div>
                <div class={`${styles.row} ${styles.displayRow}`}>
                  <GradientDisplay
                    configField='home.colors.tertiary.foreground'
                    defaultLeftColor={DEFAULT_CONFIG.home.colors.tertiary.foreground}
                    secondaryConfigField='home.colors.tertiary.background'
                    defaultRightColor={DEFAULT_CONFIG.home.colors.tertiary.background}
                    namespace={channel?.id}
                  />
                </div>
              </div>
            </div>
            <div class={`${styles.row} ${styles.large}`}>
              <div class={styles.rowText}>Correct Answer</div>
              <div class={styles.colorContainer}>
                <div class={`${styles.row} ${styles.colorRow}`}>
                  <div class={styles.color}>
                    <ConfigColorPicker
                      configField='home.colors.correct.foreground'
                      defaultColor={DEFAULT_CONFIG.home.colors.correct.foreground}
                      namespace={channel?.id}
                    />
                  </div>
                  <div class={styles.color}>
                    <ConfigColorPicker
                      configField='home.colors.correct.background'
                      defaultColor={DEFAULT_CONFIG.home.colors.correct.background}
                      namespace={channel?.id}
                    />
                  </div>
                </div>
                <div class={`${styles.row} ${styles.displayRow}`}>
                  <GradientDisplay
                    configField='home.colors.correct.foreground'
                    defaultLeftColor={DEFAULT_CONFIG.home.colors.correct.foreground}
                    secondaryConfigField='home.colors.correct.background'
                    defaultRightColor={DEFAULT_CONFIG.home.colors.correct.background}
                    namespace={channel?.id}
                  />
                </div>
              </div>
            </div>

            <div class={styles.row}>
              <div class={styles.rowText}>Level: 1</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='home.colors.levels.1'
                  defaultColor={DEFAULT_CONFIG.home.colors.levels[1]}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Level: 2</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='home.colors.levels.2'
                  defaultColor={DEFAULT_CONFIG.home.colors.levels[2]}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Level: 3</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='home.colors.levels.3'
                  defaultColor={DEFAULT_CONFIG.home.colors.levels[3]}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Level: 4</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='home.colors.levels.4'
                  defaultColor={DEFAULT_CONFIG.home.colors.levels[4]}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
            </div>
          </div>
          <div class={styles.middle}>
            <div class={styles.modeRow}>
              <div class={styles.image}>
                <button class={cn('outline', 'disabled', styles.previewBtn)} disabled></button>
              </div>
              <div class={styles.image}>
                <button class={cn('outline', 'disabled', styles.nonPreviewBtn)}></button>
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.image}>
                <ConfigFileUpload configField='home.images.background.portrait' namespace={channel?.id} />
              </div>
              <div class={styles.image}>
                <ConfigFileUpload configField='home.images.background.landscape' namespace={channel?.id} />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.image}>
                <ConfigFileUpload configField='home.images.header.portrait' namespace={channel?.id} />
              </div>
              <div class={styles.image}>
                <ConfigFileUpload configField='home.images.header.landscape' namespace={channel?.id} />
              </div>
            </div>
            <div class={styles.row}>
              <div class={`${styles.rowText} ${styles.full}`}>Sentiment Scale</div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Disagree</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='home.colors.sentiment.1'
                  defaultColor={DEFAULT_CONFIG.home.colors.sentiment[1]}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Not Sure</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='home.colors.sentiment.2'
                  defaultColor={DEFAULT_CONFIG.home.colors.sentiment[2]}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Neutral</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='home.colors.sentiment.3'
                  defaultColor={DEFAULT_CONFIG.home.colors.sentiment[3]}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Agree</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='home.colors.sentiment.4'
                  defaultColor={DEFAULT_CONFIG.home.colors.sentiment[4]}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Complete Agree</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='home.colors.sentiment.5'
                  defaultColor={DEFAULT_CONFIG.home.colors.sentiment[5]}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
            </div>
          </div>
          <div class={styles.right}>
            <div class={styles.modeRow}></div>
            <div class={styles.row}>
              <div class={styles.rowText}>Main Logo</div>
              <div class={styles.image}>
                <ConfigFileUpload configField='home.images.mainLogo' namespace={channel?.id} />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Secondary Logo</div>
              <div class={styles.image}>
                <ConfigFileUpload configField='home.images.headerLogo' namespace={channel?.id} />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Font</div>
              <div class={styles.image}>
                <ConfigFileUpload type='font' configField='home.font' namespace={channel?.id} />
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
