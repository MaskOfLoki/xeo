import { LeaderboardSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';
import { ConfigColorPicker } from '../../../config-color-picker';
import { DEFAULT_CONFIG, MobilePreviewMode } from '../../../../../../../common/common';
import { ConfigFileUpload } from '../../../config-file-upload';
import { MobilePreview } from '../../../mobile-preview';

export function template(this: LeaderboardSettings, { channel }: IChannelStateAttrs) {
  return (
    <div class={styles.container}>
      <div class={styles.mainPanel}>
        <div class={styles.leaderboardLabel}>LEADERBOARD</div>
        <div class={styles.mainContent}>
          <div class={styles.left}>
            <div class={styles.modeRow} />
            <div class={styles.row}>
              <div class={styles.rowText}>Background</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='leaderboard.colors.background'
                  defaultColor={DEFAULT_CONFIG.leaderboard.colors.background}
                  gradient={true}
                  defaultValueField='home.colors.background'
                  namespace={channel?.id}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Leaderboard 01</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='leaderboard.colors.primary'
                  defaultColor={DEFAULT_CONFIG.leaderboard.colors.primary}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
              <div class={styles.image}></div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Leaderboard 02</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='leaderboard.colors.secondary'
                  defaultColor={DEFAULT_CONFIG.leaderboard.colors.secondary}
                  gradient={true}
                  namespace={channel?.id}
                />
              </div>
              <div class={styles.image}></div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Text</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='leaderboard.colors.text'
                  defaultColor={DEFAULT_CONFIG.leaderboard.colors.text}
                  defaultValueField='home.colors.text'
                  namespace={channel?.id}
                />
              </div>
              <div class={styles.image}></div>
            </div>
          </div>
          <div class={styles.right}>
            <div class={styles.modeRow}>
              <div class={styles.image}>
                <button class={cn('outline', 'disabled', styles.previewBtn)} disabled />
              </div>
              <div class={styles.image}>
                <button class={cn('outline', 'disabled', styles.nonPreviewBtn)} />
              </div>
            </div>

            <div class={styles.row}>
              <div class={styles.image}>
                <ConfigFileUpload configField='leaderboard.images.background.portrait' namespace={channel?.id} />
              </div>
              <div class={styles.image}>
                <ConfigFileUpload configField='leaderboard.images.background.landscape' namespace={channel?.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class={styles.previewPanel}>
        <MobilePreview mode={MobilePreviewMode.RANK} class={styles.preview} channelId={channel?.id || ''} />
      </div>
    </div>
  );
}
