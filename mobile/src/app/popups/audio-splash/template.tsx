import { AudioSplashPopup } from './index';
import styles from './module.scss';
import m from 'mithril';
import { config } from '../../services/ConfigService';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export function template(this: AudioSplashPopup) {
  return (
    <div
      class={styles.screen}
      onclick={this.clickHandler.bind(this)}
      style={{
        backgroundColor: config.home.colors.background,
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
