import { EditStream } from './index';
import styles from './module.scss';
import m from 'mithril';
import { Input } from '../../../../input';

export function template(this: EditStream) {
  return (
    <div class={styles.control}>
      <div class={styles.label}>Stream Name</div>
      <Input value={this.stream.name} oninput={(e) => (this.stream.name = e.target.value)} />
      <div class={styles.label}>Stream URL</div>
      <Input value={this.url} oninput={(e) => (this.url = e.target.value)} />
      <div class={styles.label}>Stream Key</div>
      <Input value={this.streamKey} oninput={(e) => (this.streamKey = e.target.value)} />
      <div class={styles.buttons}>
        <button onclick={this.buttonSaveHandler.bind(this)}>SAVE</button>
      </div>
    </div>
  );
}
