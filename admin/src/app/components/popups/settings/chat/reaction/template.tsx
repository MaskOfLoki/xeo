import styles from './module.scss';
import { ReactionSettings } from './index';
import m from 'mithril';
import { IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';
import { ConfigSlide } from '../../../../config-slide';
import { ConfigFileUpload } from '../../../../config-file-upload';

export function template(this: ReactionSettings, { channel }: IChannelStateAttrs) {
  return (
    <div class={styles.container}>
      <div class={styles.row}>
        <div class={styles.configSlider}>
          <div class={styles.sliderLabel}>Chat Reactions</div>
          <ConfigSlide
            class={styles.configSlide}
            configField='misc.chat.enableReaction'
            namespace={channel?.id}
          ></ConfigSlide>
        </div>
        <div class={styles.image}>
          <div class={styles.imageLabel}>Chat Reaction Images</div>
          <div class={styles.imageReactions}>
            <ConfigFileUpload class={styles.fileUpload} configField='misc.chat.reaction1' namespace={channel?.id} />
            <ConfigFileUpload class={styles.fileUpload} configField='misc.chat.reaction2' namespace={channel?.id} />
            <ConfigFileUpload class={styles.fileUpload} configField='misc.chat.reaction3' namespace={channel?.id} />
            <ConfigFileUpload class={styles.fileUpload} configField='misc.chat.reaction4' namespace={channel?.id} />
            <ConfigFileUpload class={styles.fileUpload} configField='misc.chat.reaction5' namespace={channel?.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
