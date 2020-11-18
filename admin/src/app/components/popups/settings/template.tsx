import { SettingsPopup } from './index';
import styles from './module.scss';
import m from 'mithril';
import { IChannelStateAttrs } from '../../../utils/ChannelStateComponent';

export function template(this: SettingsPopup, { channel }: IChannelStateAttrs) {
  return (
    <div class={styles.popup}>
      <div class={styles.header}>
        <div class={styles.left}>
          <span class={styles.icon} />
          <div class={styles.subTitle}>{channel ? `${channel.name.toUpperCase()} CHANNEL` : 'GLOBAL'} SETTINGS</div>
        </div>
        <div class={styles.right}>
          <div class={styles.closeButton} onclick={this.close.bind(this)}></div>
        </div>
      </div>
      <div class={styles.content}>
        <div class={styles.menuContent}>
          {this.menus.map((menu) => (
            <button
              class={this.selectedMenu == menu ? 'selected' : 'outline'}
              onclick={() => (this.selectedMenu = menu)}
            >
              {menu.label}
            </button>
          ))}
        </div>
        <div class={styles.mainConent}>
          {m(this.selectedMenu.component, { channel, onconfigimport: this.onConfigImport.bind(this) })}
        </div>
      </div>
    </div>
  );
}
