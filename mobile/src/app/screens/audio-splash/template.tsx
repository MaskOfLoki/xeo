import { AudioSplashScreen } from './index';
import styles from './module.scss';
import m from 'mithril';
import { config } from '../../services/ConfigService';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export function template(this: AudioSplashScreen) {
  return (
    <div
      class={styles.screen}
      onclick={this.clickHandler.bind(this)}
      style={{
        backgroundImage: `url(${config.audioSplash.background})`,
      }}
    >
      {!isEmptyString(config.audioSplash.logo) && (
        <div
          class={styles.logo}
          style={{
            backgroundImage: `url(${config.audioSplash.logo})`,
          }}
        />
      )}
      <div class={styles.message}>{config.audioSplash.message}</div>
    </div>
  );
}
