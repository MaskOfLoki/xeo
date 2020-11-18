import { QuickAddThumbs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { Input } from '../../input';
import { MAX_HEADER, MAX_MESSAGE } from '../../../utils';

export function template(this: QuickAddThumbs, { onchange }) {
  return (
    <div class={styles.control}>
      <Input
        placeholder='Headline'
        value={this.card.header}
        maxlength={MAX_HEADER}
        oninput={(e) => {
          this.card.header = e.target.value;
          onchange && onchange();
        }}
      />
      <Input
        placeholder='Sub Headline'
        value={this.card.message}
        maxlength={MAX_MESSAGE}
        oninput={(e) => {
          this.card.message = e.target.value;
          onchange && onchange();
        }}
      />
    </div>
  );
}
