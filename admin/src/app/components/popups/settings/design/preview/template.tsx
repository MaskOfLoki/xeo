import { HomeSettingsPreview } from './index';
import styles from './module.scss';
import m from 'mithril';
import { IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';
import { MobilePreview } from '../../../../mobile-preview';

export function template(this: HomeSettingsPreview, { channel }: IChannelStateAttrs) {
  return (
    <div class={styles.control}>
      <div class={styles.content}>
        <MobilePreview mode={this.selectedMenu.mode} class={styles.preview} channelId={channel?.id} />
      </div>
      <div class={styles.bottom}>
        {this.menus.map((menu) => (
          <button class={this.selectedMenu == menu ? 'selected' : 'outline'} onclick={() => (this.selectedMenu = menu)}>
            {menu.label}
          </button>
        ))}
      </div>
    </div>
  );
}
