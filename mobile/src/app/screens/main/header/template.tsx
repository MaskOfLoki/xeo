import { Header } from './index';
import m from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { orientation } from '../../../services/OrientationService';
import { config } from '../../../services/ConfigService';
import styles from './module.scss';
import { Avatar } from '../../../components/avatar';
import { isEmptyObject, numberWithCommas } from '../../../../../../common/utils';
import { DEFAULT_CONFIG } from '../../../../../../common/common';
import cn from 'classnames';

export function template(this: Header) {
  const headerStyles: any = {};
  const color = config.home?.colors?.levels?.[4];

  if (!isEmptyObject(config.home.images?.header)) {
    let headerImageString = '';
    if (orientation.isPortrait) {
      headerImageString = config.home.images.header.portrait;
    } else {
      headerImageString = config.home.images.header.landscape;
    }
    headerStyles.backgroundImage = `url(${headerImageString})`;
    headerStyles.backgroundPosition = 'center';
    headerStyles.backgroundRepeat = 'no-repeat';
    headerStyles.backgroundSize = 'cover';
  } else {
    headerStyles.backgroundImage = '';
  }

  if (!isEmptyString(config.home?.colors?.levels?.[4] as string)) {
    headerStyles.backgroundColor = config.home?.colors?.levels?.[4] as string;
  } else {
    headerStyles.backgroundColor = DEFAULT_CONFIG.home.colors.levels[4];
  }

  const route = m.route.get();

  return (
    <div class={styles.headerContainer}>
      <div class={styles.overlay} id='header_overlay' onclick={this.onSlideNav.bind(this)}></div>
      <div
        class={cn(styles.header, { [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent })}
        style={headerStyles}
        id='header'
      >
        <div class={styles.userInfoContainer}>
          {this.showInfo && (
            <div class={styles.userLabelContainer}>
              <div class={styles.userLabels}>
                <div class={styles.userPointsLabel} style={{ color: config.home?.colors?.levels?.[1] }}>
                  PTS
                </div>
              </div>
              <div class={styles.userValues}>
                <div
                  class={styles.userPoints}
                  style={{ color: config.home?.colors?.levels?.[1], backgroundColor: config.home?.colors?.levels?.[3] }}
                >
                  {numberWithCommas(this.points)}
                </div>
              </div>
            </div>
          )}
        </div>
        <div class={styles.hamburgerMenuContainer}>
          {!route.includes('home') && this.isEvent && (
            <div class={styles.eventNotification} onclick={() => this.goToHome()}></div>
          )}
          <div
            class={styles.hamburgerMenu}
            onclick={this.onSlideNav.bind(this)}
            style={{ background: config.home?.colors?.levels?.[1] }}
          />
        </div>
        {/* TODO: move side navigation into dedicated component. Use iteration for navigation items */}
        <div id='main_nav' class={styles.slidenav} style={{ background: color }}>
          <a
            class={cn(styles.entry, { [styles.selected]: route.includes('profile') })}
            onclick={() => this.onRouterClick('profile')}
          >
            <div class={styles.profileLink}>
              <Avatar />
            </div>
            <div class={styles.avatarLabel}>{this.username}</div>
            <div class={styles.avatarRank}>
              RANK: <span>1</span>
            </div>
          </a>
          <div class={styles.border} style={{ borderColor: config.home?.colors?.levels?.[2] }} />
          <a
            class={cn(styles.entry, { [styles.selected]: route.includes('home') })}
            onclick={() => this.onRouterClick('home')}
          >
            <div class={styles.homeImg} style={{ background: config.home?.colors?.levels?.[1] }} />
            <span>Home</span>
          </a>
          <div class={styles.border} style={{ borderColor: config.home?.colors?.levels?.[2] }} />
          {this.showRankItem && (
            <a
              class={cn(styles.entry, { [styles.selected]: route.includes('rank') })}
              onclick={() => this.onRouterClick('rank')}
            >
              <div class={styles.rankImg} style={{ background: config.home?.colors?.levels?.[1] }} />
              <span>Rank</span>
            </a>
          )}
          {this.showRankItem && <div class={styles.border} style={{ borderColor: config.home?.colors?.levels?.[2] }} />}
          <a
            class={cn(styles.entry, { [styles.selected]: route.includes('arcade') })}
            onclick={() => this.onRouterClick('arcade')}
          >
            <div class={styles.arcadeImg} style={{ background: config.home?.colors?.levels?.[1] }} />
            <span>Arcade</span>
          </a>
          <div class={styles.border} style={{ borderColor: config.home?.colors?.levels?.[2] }} />
          {this.enableChatroom && this.showChatroomItem && (
            <a
              class={`${styles.entry} ${route.includes('chat') ? styles.selected : ''}`}
              onclick={() => this.onRouterClick('chat')}
            >
              <div class={styles.chatImg} style={{ background: config.home?.colors?.levels?.[1] }} />
              <span>Chatroom</span>
            </a>
          )}
          {this.enableChatroom && this.showChatroomItem && (
            <div class={styles.border} style={{ borderColor: config.home?.colors?.levels?.[2] }} />
          )}
          <a
            class={cn(styles.entry, { [styles.selected]: route.includes('prizes') })}
            onclick={() => this.onRouterClick('prizes')}
          >
            <div class={styles.prizesImg} style={{ background: config.home?.colors?.levels?.[1] }} />
            <span>Prizes</span>
          </a>
          {this.enableChatroom && (
            <div class={styles.border} style={{ borderColor: config.home?.colors?.levels?.[2] }} />
          )}
          {this.terms.length > 0 && (
            <a class={styles.entry} onclick={this.onTerms.bind(this)}>
              <div class={styles.termsImg} style={{ background: config.home?.colors?.levels?.[1] }} />
              <span>Terms &amp; Conditions</span>
            </a>
          )}
          <div class={styles.border} style={{ borderColor: config.home?.colors?.levels?.[2] }} />
        </div>
        {/* TODO: move terms into dedicated component */}
        {this.terms.length > 0 && (
          <div id='terms_nav' class={`${styles.slidenav} ${styles.subnav}`} style={{ background: color }}>
            <a class={styles.entry} onclick={this.onTerms.bind(this)}>
              <div class={styles.backImg} style={{ background: config.home?.colors?.levels?.[1] }} />
              <span>Back</span>
            </a>
            <div class={styles.border} style={{ borderColor: config.home?.colors?.levels?.[2] }} />
            {this.terms.map((term) => (
              <div>
                <a class={styles.entry} href={term.url}>
                  <div class={styles.termsImg} style={{ background: config.home?.colors?.levels?.[1] }} />
                  <span>{term.name}</span>
                </a>
                <div class={styles.border} style={{ borderColor: config.home?.colors?.levels?.[2] }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
