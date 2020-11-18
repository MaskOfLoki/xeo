import m from 'mithril';
import { ConfirmationPopup } from '.';
import styles from './module.scss';
import { Button } from '../../components/button';
import { config } from '../../services/ConfigService';

export function template(this: ConfirmationPopup, attrs) {
  return (
    <div class={styles.popup} style={{ background: config.home.colors.background }}>
      <div class={styles.message} style={{ color: config.home.colors.text }}>
        {attrs.message}
      </div>
      <div class={styles.button_container}>
        <Button class={styles.button} onclick={this.onSelection.bind(this, true)}>
          YES
        </Button>
        <Button class={styles.button} onclick={this.onSelection.bind(this, false)}>
          NO
        </Button>
      </div>
    </div>
  );
}
