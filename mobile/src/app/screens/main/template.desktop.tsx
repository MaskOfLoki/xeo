import { MainScreen } from './index';
import styles from './module.desktop.scss';
import m, { route, Vnode } from 'mithril';
import { Header } from './header';
import { ProgrammedVideo } from '../../components/programmed-video';
import cn from 'classnames';
import { PauseOverlay } from '../../components/pause-overlay';
import { liveCard } from '../../services/live-card';
import { FeedBar } from './feed-bar';
import { MarketingMessage } from '../../components/marketing-message';
import { ChatScreen } from './chat';
import { config } from '../../services/ConfigService';
import { RankScreen } from './rank';
import { deviceService } from '../../services/DeviceService';
import { Avatar } from '../../components/avatar';
import { numberWithCommas } from '../../../../../common/utils';

export function template(this: MainScreen, vnode: Vnode) {
  const currentRoute = route.get().replace('/', '');
  const isChatScreen = currentRoute.startsWith('chat');
  const hasChat = this.showChatroom && (currentRoute.startsWith('home') || deviceService.isDesktop);
  return (
    <div
      class={cn(styles.screen, {
        [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
        [styles.hasChat]: hasChat,
      })}
    >
      <Header hasChat={hasChat} hasChannelVideo={this.hasChannelVideo && this.showMediaContent} />
      <div class={styles.content}>
        <div class={styles.left}>
          <div
            class={styles.gameLogo}
            style={{
              backgroundImage: config.home.images?.mainLogo ? `url(${config.home.images?.mainLogo})` : '',
            }}
          />
          {this.hasChannelVideo && !this.showChatroom && (
            <div class={styles.videoContainer}>
              <ProgrammedVideo class={styles.video} />
            </div>
          )}
          {hasChat && (
            <div class={styles.chatContainer}>
              <ChatScreen />
            </div>
          )}
          {!this.hasChannelVideo && !hasChat && (
            <div class={styles.rankContainer}>
              <RankScreen />
            </div>
          )}
          {!this.showMarketingMessages && <FeedBar class={styles.messageContainer} />}
          {this.showMarketingMessages && <MarketingMessage class={styles.messageContainer} />}
        </div>
        <div class={styles.right} style={{ backgroundColor: `${config.home.colors.levels[4]}19` }}>
          <div class={styles.subheader} style={{ backgroundColor: `${config.home.colors.levels[4]}63` }}>
            <div class={styles.points}>
              <div class={styles.userLabels}>
                <div class={styles.userPointsLabel} style={{ color: config.home?.colors?.levels?.[1] }}>
                  PTS
                </div>
              </div>
              <div class={styles.userValues}>
                <div
                  class={styles.userPoints}
                  style={{
                    color: config.home?.colors?.levels?.[1],
                    background: `linear-gradient(to right, ${config.home.colors.secondary.foreground}, ${config.home.colors.secondary.background})`,
                  }}
                >
                  <div class={styles.text}>{numberWithCommas(this.points)}</div>
                </div>
              </div>
            </div>
            <div class={styles.profileInfo}>
              <div class={styles.info}>
                <div class={styles.username}>{this.username}</div>
                <div class={styles.rank}>Rank: {this.rank}</div>
              </div>
              <Avatar />
            </div>
          </div>
          <div class={cn(styles.subscreen, { [styles.hideChatroom]: isChatScreen })}>
            {vnode.children && vnode.children[0]}
          </div>
        </div>
      </div>

      {liveCard.paused && <PauseOverlay />}
    </div>
  );
}
