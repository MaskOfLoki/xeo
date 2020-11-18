import { ChannelMedia } from '.';
import styles from './module.scss';
import m from 'mithril';
import { Video } from '../../../../../../../../common/components/video';
import cn from 'classnames';
import { api } from '../../../../../services/api';

export function template(this: ChannelMedia) {
  return (
    <div class={styles.control}>
      <Video class={styles.video} src={this.channel.media} ref={(value) => (this.player = value)} wowza={api} />
      <div
        class={cn({
          [styles.buttonPlay]: this.player?.paused,
          [styles.buttonPause]: !this.player?.paused,
        })}
        onclick={this.buttonPlayPauseHandler.bind(this)}
      ></div>
    </div>
  );
}
