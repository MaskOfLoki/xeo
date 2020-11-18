import m from 'mithril';
import { INotificationAttrs, NotificationPopup } from '.';
import styles from './module.scss';
import { Button } from '../../components/button';

export function template(this: NotificationPopup, { messageLines }: INotificationAttrs) {
  return (
    <div class={styles.popup}>
      <div class={styles.message}>
        {messageLines.map((line) => (
          <p>{line}</p>
        ))}
      </div>
      <div class={styles.button_container}>
        <Button class={styles.button} onclick={() => this.close()}>
          Close
        </Button>
      </div>
    </div>
  );
}
