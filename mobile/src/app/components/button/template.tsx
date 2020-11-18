import m, { Vnode } from 'mithril';
import cn from 'classnames';
import { IButtonAttrs } from '.';
import { config } from '../../services/ConfigService';
import styles from './module.scss';
import { DEFAULT_CONFIG } from '../../../../../common/common';

export function template(vnode: Vnode<IButtonAttrs>) {
  if (!vnode.attrs.class) {
    vnode.attrs.class = '';
  }

  const attrs = {
    ...vnode.attrs,
  };

  delete attrs.class;
  delete attrs.disabled;
  delete attrs.outline;
  const backgroundColor = config.home.colors.button ?? DEFAULT_CONFIG.home.colors.button ?? '#21abfc';

  return (
    <div
      class={cn(styles.button, ...vnode.attrs.class.split(' '), {
        [styles.disabled]: vnode.attrs.disabled,
        [styles[vnode.attrs.type || 'default']]: true,
      })}
      style={{
        background: vnode.attrs.outline ? 'none' : backgroundColor,
        border: vnode.attrs.outline ? `0.5vmin ${backgroundColor} solid` : 'none',
        color: config.home.colors.text ?? DEFAULT_CONFIG.home.colors.text,
      }}
      {...attrs}
    >
      {vnode.children}
    </div>
  );
}
