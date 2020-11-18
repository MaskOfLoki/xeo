import { ChatroomSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';
import { ConfigSlide } from '../../../../config-slide';

export function template(this: ChatroomSettings, { channel }: IChannelStateAttrs) {
  return (
    <div class={styles.container}>
      <div class={styles.configSlider}>
        <div class={styles.sliderLabel}>
          Enable Chatroom
          <br />
          (Chatroom still in development)
        </div>
        <ConfigSlide class={styles.configSlide} configField='misc.enableChatroom' namespace={channel?.id}></ConfigSlide>
      </div>
    </div>
  );
}
