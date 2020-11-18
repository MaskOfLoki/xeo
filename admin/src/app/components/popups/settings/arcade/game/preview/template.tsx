import { GameSettingsPreview } from './index';
import styles from './module.scss';
import m from 'mithril';
import { MobilePreview } from '../../../../../mobile-preview';

export function template(this: GameSettingsPreview, channel) {
  return (
    <div class={styles.control}>
      <div class={styles.content}>
        <MobilePreview mode={this.selectedMenu.component} class={styles.preview} channelId={channel?.id} />
      </div>
    </div>
  );
}
