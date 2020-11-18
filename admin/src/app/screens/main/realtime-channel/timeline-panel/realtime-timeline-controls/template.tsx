import { RealtimeTimelineControls } from './index';
import styles from './module.scss';
import m from 'mithril';
import { Tooltip } from '../../../../../components/tooltip';
import cn from 'classnames';

export function template(this: RealtimeTimelineControls) {
  return (
    <div class={cn(styles.control, { [styles.disabled]: !this.channel?.online })}>
      <Tooltip content='hh:mm:ss'>
        <div class={styles.groupTimer}>
          <div class={styles.icon}></div>
          {this.timerValue}
        </div>
      </Tooltip>
      <button class='outline' onclick={this.buttonSaveHandler.bind(this)}>
        SAVE
      </button>
    </div>
  );
}
