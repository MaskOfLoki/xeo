import { IChatSettings, ChatSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { ChatroomSettings } from './room';
import { ReactionSettings } from './reaction';

export function template(this: ChatSettings, { channel }: IChatSettings) {
  return (
    <div class={styles.mainContainer}>
      <div class={styles.chatroomLabel}>Chatroom</div>
      <div class={styles.panel}>
        <div class={styles.roomPanel}>
          <ChatroomSettings channel={channel} />
        </div>
        <div class={styles.reactionPanel}>
          <ReactionSettings channel={channel} />
        </div>
      </div>
    </div>
  );
}
