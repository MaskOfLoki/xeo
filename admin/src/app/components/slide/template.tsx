import { ISlideAttrs } from './index';
import styles from './module.scss';
import m, { Vnode } from 'mithril';
import cn from 'classnames';

export function template({ children, attrs }: Vnode<ISlideAttrs>) {
  return (
    <div
      title={attrs.title}
      class={cn(styles.slide, attrs.class, { [styles.readonly]: attrs.readonly })}
      onclick={() => attrs.onchange(!attrs.selected)}
    >
      {children && <span class={styles.label}>{children}</span>}
      <input class={cn(styles.tgl, styles.tglIos)} type='checkbox' checked={attrs.selected} />
      <label class={styles.tglBtn} />
    </div>
  );
}
