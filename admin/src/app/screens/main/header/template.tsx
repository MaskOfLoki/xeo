import m from 'mithril';
import styles from './module.scss';
import { Menu } from './menu';
import { IHeaderAttrs } from '.';

export function template({ channel, onsave, channels, onrestore, ondelete, ondeleteexpired }: IHeaderAttrs) {
  return (
    <div class={styles.header}>
      <div class={styles.logo} />
      <div class={styles.title}>EXTEND YOUR EXPERIENCE</div>
      <Menu
        channel={channel}
        onsave={onsave}
        channels={channels}
        ondelete={ondelete}
        onrestore={onrestore}
        ondeleteexpired={ondeleteexpired}
      />
    </div>
  );
}
