import { GameSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { GameSettingsPreview } from './preview';
import { IChannel } from '../../../../../../../../common/common';
import { GAME_CONFIG_FIELDS } from '../../../../../../../../common/constants/arcade';

export function template(this: GameSettings, channel: IChannel) {
  const nextDeployStack = window.location.pathname.includes('next') ? 'next/' : '';
  return (
    <div class={styles.control}>
      <div class={styles.left}>
        <div class={styles.main}>
          {this.menus.map((menu) => (
            <div class={styles.content}>
              {m(menu.component, {
                config: GAME_CONFIG_FIELDS[this.gid],
                channel,
              })}
            </div>
          ))}
          {this.premium && (
            <div class={styles.premiumAdminLink}>
              <button
                onclick={() => {
                  window.open(
                    GC_PRODUCTION
                      ? `${window.location.origin}/${nextDeployStack}${this.gid}/admin?xeo&channel=${
                          channel?.id ? channel.id : ''
                        }`
                      : `http://localhost:8090?xeo&channel=${channel?.id ? channel.id : ''}`,
                  );
                }}
              >
                GAME CUSTOMIZATION
              </button>
            </div>
          )}
        </div>
      </div>
      <div class={styles.previewPanel}>
        <GameSettingsPreview channel={channel} />
      </div>
    </div>
  );
}
