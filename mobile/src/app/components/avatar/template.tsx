import { Avatar } from './index';
import styles from './module.scss';
import m from 'mithril';
import { config } from '../../services/ConfigService';

export function template(this: Avatar, attrs) {
  attrs = { ...attrs };
  const style: Partial<CSSStyleDeclaration> = {};
  const useCustomAvatar = config.signup?.activeIconSet && config.signup.activeIconSet !== 'default';

  if (useCustomAvatar && this.url) {
    style.backgroundImage = `url('${this.url}')`;
    style.borderRadius = '50%';
  } else if (this.index != null) {
    style.backgroundImage = `url(assets/images/avatars/${this.index.toString().padStart(2, '0')}.png)`;
  }

  if (attrs.style) {
    Object.assign(style, attrs.style);
    delete attrs.style;
  }

  delete attrs.index;

  return <div class={styles.avatar} {...attrs} style={style} />;
}
