import { RankScreen } from './index';
import m from 'mithril';
import { getColor, isEmptyObject, numberWithCommas } from '../../../../../../common/utils';
import cn from 'classnames';
import { config } from '../../../services/ConfigService';
import { orientation } from '../../../services/OrientationService';
import styles from './module.scss';
import { Button } from '../../../components/button';
import { deviceService } from '../../../services/DeviceService';

export function template(this: RankScreen) {
  const leaderboard = config.leaderboard;
  const style: Partial<CSSStyleDeclaration> = {};

  if (config.leaderboard?.colors?.background) {
    style.background = leaderboard.colors.background as string;
  }

  if (!isEmptyObject(leaderboard?.images?.background)) {
    if (orientation.isPortrait) {
      style.backgroundImage = `url(${leaderboard.images.background.portrait})`;
    } else {
      style.backgroundImage = `url(${leaderboard.images.background.landscape})`;
    }
  }

  if (leaderboard?.colors?.text) {
    style.color = leaderboard?.colors?.text;
  }

  return (
    <div class={cn(styles.screen, { [styles.hasChannelVideo]: this.hasChannelVideo })} style={style}>
      <div
        class={styles.title}
        style={{
          background: getTitleBackground(),
        }}
      >
        Leaderboard
      </div>
      <div class={styles.groupTabs} style={{ background: getTitleBackground() }}>
        {this.tabs &&
          this.tabs.map((tab) => (
            <div
              class={cn(styles.tab, { [styles.active]: tab.id === this.selectedTab })}
              onclick={this.tabChangeHandler.bind(this, tab.id)}
            >
              {tab.label}
            </div>
          ))}
      </div>
      {this.leaders.length === 0 && <div class={styles.labelEmpty}>NO ONE HAS SCORED YET</div>}

      {this.leaders.map((leader, index) => (
        <div class={styles.row}>
          <div
            class={styles.position}
            style={{
              color: config.home?.colors?.secondary?.foreground,
            }}
          >
            {index + 1}
          </div>
          <div class={styles.username}>{leader.username}</div>
          <div class={styles.points}>{numberWithCommas(leader.points)}</div>
        </div>
      ))}
      <div class={styles.row}>
        <div class={styles.labelYourRank}>YOUR RANK</div>
      </div>
      {/* {this.yourRank && (
        <div class={styles.row}>
          <div class={styles.labelYourRank}>YOUR RANK</div>
        </div>
      )} */}
      {this.yourRank && (
        <div class={styles.row}>
          <div
            class={styles.position}
            style={{
              color: config.home?.colors?.secondary?.foreground,
            }}
          >
            {this.yourRank.position + 1}
          </div>
          <div class={styles.username}>{this.yourRank.username}</div>
          <div class={styles.points}>{numberWithCommas(this.yourRank.points)}</div>
        </div>
      )}

      {!this.yourRank && (
        <div class={styles.row}>
          <div
            class={styles.position}
            style={{
              color: config.home?.colors?.secondary?.foreground,
            }}
          >
            {1}
          </div>
          <div class={styles.username}>Undefined Hero</div>
          <div class={styles.points}>0</div>
        </div>
      )}
      {deviceService.isMobile && <Button class={styles.homebutton} onclick={this.goToHome.bind(this)} />}
    </div>
  );
}

function getTitleBackground() {
  return `linear-gradient(to right, ${getColor(config.home.colors.secondary.background)}, ${getColor(
    config.home.colors.secondary.foreground,
  )})`;
}
