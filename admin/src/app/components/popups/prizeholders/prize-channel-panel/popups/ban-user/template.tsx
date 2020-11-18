import m from 'mithril';
import styles from './module.scss';
import { BanUserPopup } from './index';

export function template(this: BanUserPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.headerText}>
        <div class={styles.headerTitle}>{this.banOrUnban ? 'BAN' : 'UNBAN'} USER</div>
        <div class={styles.closeButton} onclick={() => this.close()} />
      </div>
      <div class={styles.mainContainer}>
        <div class={styles.title}>USER NAME: {this.userToBan.username}</div>
        <div class={styles.subTitle}>
          This will {this.banOrUnban ? 'ban' : 'unban'} the user from the channel’s leaderboard, rankings, and chatroom.
        </div>
      </div>
      <div class={styles.controls}>
        <button class={styles.cancel} onclick={this.close.bind(this, undefined)}>
          CANCEL
        </button>
        <button class={styles.confirm} onclick={this.buttonConfirmHandler.bind(this)}>
          {this.banOrUnban ? 'BAN' : 'UNBAN'} USER
        </button>
      </div>
    </div>
  );
}
