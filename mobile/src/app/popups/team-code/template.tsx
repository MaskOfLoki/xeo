import m from 'mithril';
import { TeamCodePopup } from '.';
import styles from './module.scss';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { config } from '../../services/ConfigService';

export function template(this: TeamCodePopup) {
  return (
    <div class={styles.popup} style={{ backgroundColor: config.home?.colors?.accent }}>
      <div class={styles.closeBar}>
        <div class={styles.closeButton} onclick={() => this.close()} />
      </div>
      <div class={styles.message}>Enter your code below to join a Team.</div>
      <div class={styles.input}>
        <Input value={this.code} oninput={(e) => (this.code = e.target.value)} maxlength='6' />
      </div>
      <div class={styles.button_container}>
        <Button class={styles.button} onclick={() => this.onSubmit()}>
          Enter Code
        </Button>
      </div>
    </div>
  );
}
