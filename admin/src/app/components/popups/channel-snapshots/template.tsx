import m from 'mithril';
import styles from './module.scss';
import { ChannelSnapshotsPopup } from './index';
import { formatDate } from '../prizeholders/prize-channel-panel';

export function template(this: ChannelSnapshotsPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.header}>
        <div class={styles.title}>CHANNEL SNAPSHOTS</div>
        <div class={styles.closeButton} onclick={() => this.close()} />
      </div>
      <div class={styles.row}>DATE & TIME</div>
      {this.snapshots.map((snapshot) => (
        <div class={styles.row}>
          <div class={styles.date}>{formatDate(snapshot.createdAt.getTime())}</div>
          <button onclick={this.restoreHandler.bind(this, snapshot)}>RESTORE</button>
        </div>
      ))}
    </div>
  );
}
