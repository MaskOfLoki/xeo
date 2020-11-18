import { PrizeHoldersPopup, ViewKind } from './index';
import styles from './module.scss';
import m from 'mithril';
import { PrizeChannelPanel } from './prize-channel-panel';
import { CouponPanel } from './coupon-panel';
import cn from 'classnames';

export function template(this: PrizeHoldersPopup) {
  return (
    <div class={styles.prizeHolders}>
      <div class={styles.header}>
        <div class={styles.left}>
          <span class={styles.icon} />
          <div class={styles.title}>LEADERBOARD AND PRIZING</div>
        </div>
        <div class={styles.right}>
          <button
            class={this.selectedViewKind === ViewKind.EVENT ? 'selected' : 'outline'}
            onclick={() => (this.selectedViewKind = ViewKind.EVENT)}
          >
            EVENT
          </button>
          <button
            class={this.selectedViewKind === ViewKind.DAILY ? 'selected' : 'outline'}
            onclick={() => (this.selectedViewKind = ViewKind.DAILY)}
          >
            DAILY
          </button>
          <button
            class={this.selectedViewKind === ViewKind.BANNED_USER ? 'selected' : 'outline'}
            onclick={() => (this.selectedViewKind = ViewKind.BANNED_USER)}
          >
            BANNED USERS
          </button>
          <button
            class={cn(styles.resetScoreBtn, 'outline')}
            onclick={this.resetScoresHandler.bind(this)}
            disabled={!this.selectedChannel}
          >
            RESET SCORES
          </button>
          <div class={styles.space} />
          <div class={styles.closeButton} onclick={this.close.bind(this)} />
        </div>
      </div>
      <div class={styles.main}>
        <div class={styles.leftMain}>
          <CouponPanel
            onawardeveryone={this.awardEveryoneHandler.bind(this)}
            onawardselected={this.awardSelectedHandler.bind(this)}
          />
        </div>
        <div class={styles.rightMain}>
          {this.channels.map((channel) => (
            <PrizeChannelPanel
              viewKind={this.selectedViewKind}
              selected={this.selectedChannel?.id === channel?.id}
              onselect={(value) => this.channelPanelSelectHandler(channel, value)}
              onstatechange={(value) => (this.selectedState = value)}
              ondaychange={(value) => (this.selectedDay = value)}
              onRequestChange={(value) => (this.currentRequest = value)}
              channel={channel}
              onusersselect={this.selectedUsersHandler.bind(this)}
              ref={(value) => this.addChannelView(value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
