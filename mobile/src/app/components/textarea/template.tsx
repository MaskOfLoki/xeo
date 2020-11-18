import m, { Vnode } from 'mithril';
import cn from 'classnames';
import { ITextAreaAttrs } from '.';
import { TextArea } from './index';
import { config } from '../../services/ConfigService';
import styles from './module.scss';

export function template(this: TextArea, vnode: Vnode<ITextAreaAttrs>) {
  if (!vnode.attrs.class) {
    vnode.attrs.class = '';
  }

  const attrs = {
    ...vnode.attrs,
  };

  delete attrs.class;

  return (
    <textarea
      class={cn(styles.input, ...vnode.attrs.class.split(' '))}
      style={{
        background: config.home.colors.field,
        color: config.home.colors.text,
      }}
      {...attrs}
    />
  );
}
