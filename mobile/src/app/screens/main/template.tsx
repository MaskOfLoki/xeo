import { MainScreen } from './index';
import styles from './module.scss';
import m, { route, Vnode } from 'mithril';
import { Header } from './header';
import { ProgrammedVideo } from '../../components/programmed-video';
import cn from 'classnames';
import { PauseOverlay } from '../../components/pause-overlay';
import { liveCard } from '../../services/live-card';
import { FeedBar } from './feed-bar';
import { MarketingMessage } from '../../components/marketing-message';
import { ChatScreen } from './chat';
import { PleaseRotate } from '../../utils/please-rotate';
import { XCNotificationButton } from '../../components/notification-button';

export function template(this: MainScreen, vnode: Vnode) {
  const currentRoute = route.get().replace('/', '');
  const isChatScreen = currentRoute.startsWith('chat');
  const hasChat = this.showChatroom && !isChatScreen;

  return (
    <div
      class={cn(styles.screen, {
        [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
        [styles.hasChat]: hasChat,
      })}
    >
      <Header />
      <div class={cn(styles.column, { [styles.reversed]: hasChat })}>
        {this.hasChannelVideo &&
          this.showMediaContent &&
          !this.showChatroom && [
            <MarketingMessage class={styles.messageContainer} />,
            <div class={styles.videoContainer}>
              <ProgrammedVideo class={styles.video} />
              <XCNotificationButton
                show={this.showNotificationButton}
                icon={this.notificationIcon}
                onclick={this.notificationHandler.bind(this)}
              />
            </div>,
          ]}
        {hasChat && (
          <div class={styles.chat}>
            <ChatScreen />
          </div>
        )}
        {!this.showMarketingMessages && <FeedBar class={styles.messageContainer} />}
        {this.showMarketingMessages && !this.hasChannelVideo && <MarketingMessage class={styles.messageContainer} />}
        <div class={cn(styles.subscreen, { [styles.hideChatroom]: isChatScreen, [styles.show]: this.showCard })}>
          <div class={styles.background} style={this.rotatedStyles} />
          {vnode.children && vnode.children[0]}
          <div class={styles.closeButton} onclick={this.closeHandler.bind(this)}>
            X
          </div>
        </div>
      </div>
      {liveCard.paused && <PauseOverlay />}
      <PleaseRotate disabled={this.hasChannelVideo && this.showMediaContent && !hasChat} />
    </div>
  );
}
