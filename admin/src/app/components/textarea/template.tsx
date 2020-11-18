import m from 'mithril';
import { ITextAreaAttrs, TextArea } from './index';
import styles from './module.scss';
import cn from 'classnames';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export function template(this: TextArea, attrs: ITextAreaAttrs) {
  const inputAttrs = { ...attrs };
  delete inputAttrs.label;

  return (
    <div
      class={cn(styles.groupTextArea, {
        [styles.error]: !isEmptyString(this.value),
      })}
    >
      {attrs.label && <div class={styles.textareaLabel}>{attrs.label}</div>}
      <div class={styles.inputWrapper}>
        <textarea maxlength={attrs.maxlength} {...inputAttrs} />
        {attrs.maxlength && !isNaN(attrs.maxlength) && (
          <div class={styles.characterLabel}>
            {attrs.maxlength - (this.value ? this.value.length : 0)} characters remaining
          </div>
        )}
      </div>
    </div>
  );
}
