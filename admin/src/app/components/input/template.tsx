import m from 'mithril';
import { IInputAttrs, Input } from './index';
import styles from './module.scss';
import cn from 'classnames';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { validURL } from '../../utils';

export function template(this: Input, attrs: IInputAttrs) {
  const inputAttrs = { ...attrs };
  delete inputAttrs.label;

  if (typeof attrs.maxlength === 'string') {
    attrs.maxlength = parseInt(attrs.maxlength);
  }
  return (
    <div
      class={cn(styles.groupInput, {
        [styles.error]: attrs.type === 'url' && !isEmptyString(this.value) && !validURL(this.value),
      })}
    >
      {attrs.label && <div class={styles.label}>{attrs.label}</div>}
      <div class={styles.inputWrapper}>
        <input maxlength={attrs.maxlength} {...inputAttrs} />
        {attrs.maxlength && !isNaN(attrs.maxlength) && (
          <div class={styles.characterLabel}>
            {attrs.maxlength - (this.value ? this.value.length : 0)} characters remaining
          </div>
        )}
        {this.canDelete && this.onDelete && (
          <div class={styles.clearValue} onclick={() => this.onDelete('')}>
            X
          </div>
        )}
      </div>
    </div>
  );
}
