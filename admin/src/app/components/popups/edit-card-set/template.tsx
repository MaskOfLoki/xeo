import m from 'mithril';
import styles from './module.scss';
import { EditCardSetPopup } from './index';
import { Input } from '../../input';
import { MAX_CARDSET_NAME } from '../../../utils';

export function template(this: EditCardSetPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.header}>CARD SET</div>
      <div class={styles.inputContainer}>
        <Input
          placeholder='Set Name'
          value={this.cardSet.name}
          maxlength={MAX_CARDSET_NAME}
          oninput={(e) => {
            this.cardSet.name = e.target.value;
          }}
        ></Input>
      </div>
      <div class={styles.controls}>
        <button class={styles.confirm} onclick={this.buttonSaveHandler.bind(this)}>
          SAVE CARD SET
        </button>
        <button class={styles.cancel} onclick={this.close.bind(this, undefined)}>
          CANCEL
        </button>
      </div>
    </div>
  );
}
