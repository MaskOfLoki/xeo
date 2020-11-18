import { PauseOverlay } from './index';
import styles from './module.scss';
import m from 'mithril';

export function template(this: PauseOverlay) {
  return (
    this.online && (
      <div class={styles.control}>
        {this.unsynced && <div class={styles.button} onclick={this.buttonPlayHandler.bind(this)}></div>}
        {!this.unsynced && <div class={styles.message}>The Event has been paused</div>}
      </div>
    )
  );
}
