import m from 'mithril';
import styles from './module.scss';
import { DeleteChannelPopup } from './index';
import cn from 'classnames';
import { ChannelType } from '../../../../../../common/common';

export function template(this: DeleteChannelPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.headerText}>
        <div class={styles.headerTitle}>DELETED CHANNEL</div>
        <div class={styles.space}></div>
        <div class={styles.closeButton} onclick={() => this.close()}></div>
      </div>
      {!this.isDeleteView && (
        <div class={styles.mainContainer}>
          <div class={styles.title}>
            Channels that have been deleted in the past 30 days are shown here. <br />
            After 30 days, channels are automatically deleted permanently.
            <br />
            <br />
            Click to select a channel to restore or delete permanently.
          </div>
          <div class={styles.channelList}>
            {this.curPageChannels.map((channel) => (
              <div
                class={cn(styles.channelItem, {
                  [styles.programmed]: channel.type === ChannelType.TIMELINE,
                  [styles.selected]: channel == this.channel,
                })}
                onclick={this.channelClickHandler.bind(this, channel)}
              >
                <div class={styles.channelName}>{channel.name}</div>
                <div class={styles.remainingDates}>{this.daysRemaining(channel)} days until deleted</div>
              </div>
            ))}
          </div>
          <div class={styles.pagination}>
            {[...Array(this.totalPages).keys()].map((_, i) => (
              <div
                class={cn(styles.paginationBtn, { [styles.selected]: this.curPage == i + 1 })}
                onclick={this.goToPage.bind(this, i + 1)}
              ></div>
            ))}
          </div>
        </div>
      )}
      {this.isDeleteView && (
        <div class={styles.mainContainer}>
          <div
            class={cn(styles.deletedChannel, {
              [styles.programmed]: this.channel.type === ChannelType.TIMELINE,
            })}
          >
            {this.channel.name}
          </div>
          <div class={styles.deleteTitle}>
            This will permanently delete {this.channel.name} and all associated data.
            <br />
            <br />
            Are you sure?
          </div>
        </div>
      )}
      {!this.isDeleteView && (
        <div class={styles.controls}>
          <button
            class={cn(styles.restore, { [styles.disable]: !this.channel })}
            onclick={this.restoreHandler.bind(this)}
          >
            RESTORE
          </button>
          <button
            class={cn(styles.confirm, { [styles.disable]: !this.channel })}
            onclick={this.goToDeleteView.bind(this)}
          >
            DELETE PERMANENTLY
          </button>
        </div>
      )}
      {this.isDeleteView && (
        <div class={styles.controls}>
          <button
            class={cn(styles.cancel, { [styles.disable]: !this.channel })}
            onclick={this.cancelHandler.bind(this)}
          >
            CANCEL
          </button>
          <button
            class={cn(styles.confirm, { [styles.disable]: !this.channel })}
            onclick={this.deleteHandler.bind(this)}
          >
            DELETE PERMANENTLY
          </button>
        </div>
      )}
    </div>
  );
}
