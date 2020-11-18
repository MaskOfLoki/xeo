import m, { Vnode } from 'mithril';
import cn from 'classnames';
import { IInputAttrs } from '.';
import { Input } from './index';
import { config } from '../../services/ConfigService';
import styles from './module.scss';

export function template(this: Input, vnode: Vnode<IInputAttrs>) {
  if (!vnode.attrs.class) {
    vnode.attrs.class = '';
  }

  const attrs = {
    ...vnode.attrs,
  };

  delete attrs.class;

  return (
    <input
      class={cn(styles.input, ...vnode.attrs.class.split(' '))}
      style={{
        background: config.home.colors.field,
        color: config.home.colors.text,
      }}
      {...attrs}
    />
  );
}
