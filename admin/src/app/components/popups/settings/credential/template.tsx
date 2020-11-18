import { CredentialSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { api } from '../../../../services/api';

export function template(this: CredentialSettings) {
  return (
    <div class={styles.container}>
      <div class={styles.mainPanel}>
        <button class='selected' onclick={() => api.showLoginSettings(true)}>
          CREDENTIALS
        </button>
      </div>
    </div>
  );
}
