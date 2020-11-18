import m from 'mithril';
import { TermsConditionsSettings } from '.';
import styles from './module.scss';

export function template(this: TermsConditionsSettings) {
  return (
    <div class={styles.container}>
      {this.terms && (
        <table class={styles.table}>
          <thead>
            <th>
              <td class={styles.name}>NAME</td>
              <td class={styles.url}>URL</td>
              <td></td>
            </th>
          </thead>
          <tbody>
            {this.terms.map((term, idx) => {
              return (
                <tr>
                  <td class={styles.name}>{term.name}</td>
                  <td class={styles.url}>{term.url}</td>
                  <td class={styles.actions}>
                    <button onclick={this.editTerm.bind(this, term)}>EDIT</button>
                    <button onclick={this.deleteTerm.bind(this, idx)}>DELETE</button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <button onclick={this.addTerm.bind(this)}>ADD</button>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
