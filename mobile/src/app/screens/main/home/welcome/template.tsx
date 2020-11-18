import { WelcomeScreen } from './index';
import m from 'mithril';
import { config } from '../../../../services/ConfigService';
import styles from './module.scss';
import cn from 'classnames';
import { convertHexToRGBA } from '../../../../../../../common/utils';

export function template(this: WelcomeScreen) {
  return (
    <div
      class={cn(styles.screen, {
        [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
        [styles.showChatroom]: this.showChatroom,
      })}
    >
      <div
        class={styles.logoBox}
        style={{
          background: `radial-gradient(ellipse, 
                    ${convertHexToRGBA(config.home.colors.primary.foreground as string, 0.98)} -40%, transparent 60%)`,
        }}
      >
        <div
          class={styles.gameLogo}
          style={{
            backgroundImage: `url(${config.home.images?.mainLogo ?? '../../../../../assets/images/xeo.svg'})`,
          }}
        />
      </div>
      <div class={styles.welcomeText}>{config.home.message}</div>
      <div class={styles.eventNotStartDescription}>{config.home.noEventMsg}</div>
    </div>
  );
}
