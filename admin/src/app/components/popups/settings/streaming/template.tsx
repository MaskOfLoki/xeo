import { StreamSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { EditStream } from './edit-stream';
import { StreamsList } from './streams-list';

export function template(this: StreamSettings) {
  return (
    <div class={styles.control}>
      <div class={styles.column}>
        <div class={styles.title}>STREAM</div>
        <div class={styles.buttonAddStream} onclick={this.buttonAddNewStreamHandler.bind(this)}>
          Add New Stream <div class={styles.plus}>+</div>
        </div>
        {this.selectedStream && <EditStream stream={this.selectedStream} onsave={this.streamSaveHandler.bind(this)} />}
      </div>
      <div class={styles.column}>
        <div class={styles.title}>SAVED STREAMS</div>
        <StreamsList ref={(value) => (this.streamsList = value)} onchange={(value) => (this.selectedStream = value)} />
      </div>
      <div class={styles.column}></div>
    </div>
  );
}
