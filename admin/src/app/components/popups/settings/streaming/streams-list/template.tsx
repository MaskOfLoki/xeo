import { StreamsList } from './index';
import styles from './module.scss';
import m from 'mithril';

export function template(this: StreamsList, { onchange }) {
  return (
    <div class={styles.control}>
      {this.streams.map((stream) => (
        <div class={styles.row}>
          <div class={styles.label}>{stream.name}</div>
          <div class={styles.buttonEdit} onclick={() => onchange(stream)}></div>
          <div class={styles.buttonDelete} onclick={this.buttonDeleteHandler.bind(this, stream)}></div>
        </div>
      ))}
    </div>
  );
}
