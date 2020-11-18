import m from 'mithril';
import { TermsConditionPopup } from '.';
import styles from './module.scss';
import { Input } from '../../../../input';

export function template(this: TermsConditionPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.closeButton} onclick={() => this.close()}></div>
      <div class={styles.title}>TERMS AND CONDITIONS</div>
      <Input value={this.name} oninput={(e) => (this.name = e.target.value)} placeholder='NAME' maxlength='20' />
      <Input value={this.url} oninput={(e) => (this.url = e.target.value)} placeholder='URL' />
      <button class={styles.buttonSave} onclick={this.buttonSaveHandler.bind(this)}>
        SAVE
      </button>
    </div>
  );
}
