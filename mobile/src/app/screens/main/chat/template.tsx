import { ChatScreen } from './index';
import m from 'mithril';
import cn from 'classnames';
import { config } from '../../../services/ConfigService';
import styles from './module.scss';

export function template(this: ChatScreen) {
  return (
    <div
      class={cn(styles.screen, {
        [styles.hasChannelVideo]: this.hasChannelVideo,
        [styles.showChatroom]: this.showChatroom,
      })}
    >
      <div class={styles.groupTabs} style={{ backgroundColor: config.home?.colors?.levels?.[4] as string }}>
        {this.tabs.map((tab) => (
          <div
            class={cn(styles.tab, { [styles.active]: tab.id === this.namespace })}
            style={{
              backgroundColor: config.home?.colors?.levels?.[2] as string,
              color: config.home?.colors?.levels?.[1] as string,
              borderBottomColor: config.home?.colors?.levels?.[1] as string,
            }}
            onclick={this.tabChangeHandler.bind(this, tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div class={styles.chatFeed} />
      {!this.isBanned && (
        <div class={styles.controlContainer}>
          <div class={styles.chatInputContainer}>
            <input
              class={styles.chatInput}
              style={{
                backgroundColor: config.home?.colors?.levels?.[2] as string,
                borderBottom: config.home?.colors?.levels?.[1] as string,
                color: config.home?.colors?.levels?.[1] as string,
              }}
              maxlength='250'
              value={this.chatMessage}
              placeholder='Type a message...'
              oninput={(e) => (this.chatMessage = (e.target as HTMLInputElement).value)}
              onkeypress={(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.submitChatMessage();
                }
              }}
            />
          </div>
          <div
            class={cn(styles.chatButton, {
              [styles.disabled]: this.isSending,
            })}
            onclick={this.submitChatMessage.bind(this)}
            style={{ backgroundColor: config.home?.colors?.levels?.[1] as string }}
          />
        </div>
      )}
      {this.isBanned === true && (
        <div class={styles.controlContainer} style={{ backgroundColor: config.home?.colors?.levels?.[4] as string }}>
          <div class={styles.bannedMessage}>You have been banned from chat</div>
        </div>
      )}
    </div>
  );
}
