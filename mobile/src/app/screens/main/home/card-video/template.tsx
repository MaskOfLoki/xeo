import m, { redraw } from 'mithril';

import { isEmptyString, isIOS } from '@gamechangerinteractive/xc-backend/utils';
import { Button } from '../../../../components/button';
import { Video } from '../../../../../../../common/components/video';
import { CardVideoScreen } from './index';
import styles from './module.scss';
import cn from 'classnames';
import { isPreview } from '../../../../../../../common/utils/query';
import { api } from '../../../../services/api';
import { config } from '../../../../services/ConfigService';

export function template(this: CardVideoScreen) {
  return (
    <div
      class={cn(styles.screen, {
        [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
        [styles.showChatroom]: this.showChatroom,
      })}
    >
      <div class={styles.cardContents}>
        {!isEmptyString(this.card.message) && <div class={styles.message}>{this.card.message}</div>}
        <div class={styles.videoContents}>
          <Video
            class={styles.video}
            src={this.card.video}
            loop={this.card.loop}
            autoplay
            muted={isIOS() || !config.audioSplash.enabled}
            ref={this.setVideoPlayer.bind(this)}
            onplay={redraw}
            ontoggleplay={this.togglePlayHandler.bind(this)}
            style={{
              backgroundColor: 'transparent',
            }}
            onclick={this.buttonPlayHandler.bind(this)}
            wowza={api}
          />
          {this.isPaused && (
            <div
              class={cn({
                [styles.buttonPlay]: this.isPaused,
                [styles.buttonPause]: !this.isPaused,
              })}
              onclick={this.buttonPlayHandler.bind(this)}
            ></div>
          )}
          <div
            class={cn(styles.sound, {
              [styles.unmute]: this.isMuted,
              [styles.mute]: !this.isMuted,
            })}
            onclick={this.buttonMuteHandler.bind(this)}
          />
        </div>
      </div>
      {true && (
        <div class={styles.cardExtra}>
          {this.isReady &&
            true &&
            true && [
              <div class={styles.message}>Bonus points for sharing!</div>,
              <div class={styles.shareButtonContainer}>
                <div class={styles.facebook} onclick={this.buttonShareHandler.bind(this)} />
                <div class={styles.twitter} onclick={this.buttonShareHandler.bind(this)} />
                <div class={styles.instagram} onclick={this.buttonShareHandler.bind(this)} />
              </div>,
            ]}
        </div>
      )}
    </div>
  );
}
