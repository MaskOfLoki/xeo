import { ProgrammedVideo } from './index';
import m from 'mithril';
import { Video } from '../../../../../common/components/video';
import styles from './module.scss';
import cn from 'classnames';
import { ChannelType } from '../../../../../common/common';
import { api } from '../../services/api';
import { config } from '../../services/ConfigService';
import { isIOS } from '@gamechangerinteractive/xc-backend/utils';

export function template(this: ProgrammedVideo, attrs) {
  return (
    <div class={cn(styles.control, attrs.class)}>
      <Video
        class={styles.video}
        src={this.url}
        autoplay={!(isIOS() && config.audioSplash.enabled)}
        ontoggleplay={this.togglePlayHandler.bind(this)}
        // autoplay doesn't work without muted
        muted={!config.audioSplash.enabled || !this.channel.showMedia}
        ref={this.videoPlayerReadyHandler.bind(this)}
        wowza={api}
        time={api}
      />
      <div
        class={cn(styles.sound, {
          [styles.unmute]: this.muted,
          [styles.mute]: !this.muted,
        })}
        onclick={this.buttonSoundHandler.bind(this)}
      />
      {!this.paused && !this.synced && this.channel?.type === ChannelType.TIMELINE && (
        <div class={styles.pause} onclick={this.pauseHandler.bind(this)}></div>
      )}
    </div>
  );
}
