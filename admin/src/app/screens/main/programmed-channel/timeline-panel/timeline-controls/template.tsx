import { TimelineControls, ITimelineControlsAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { Tooltip } from '../../../../../components/tooltip';

export function template(this: TimelineControls, { onnext, onprev, playing, ontoggleplay }: ITimelineControlsAttrs) {
  return (
    <div class={styles.control}>
      <Tooltip content='Go to Previous Card'>
        <div class={styles.buttonPrev} onclick={onprev}></div>
      </Tooltip>
      <div
        class={cn({
          [styles.buttonPlay]: !playing,
          [styles.buttonPause]: playing,
        })}
        onclick={ontoggleplay}
      ></div>
      <Tooltip content='Go to Next Card'>
        <div class={styles.buttonNext} onclick={onnext}></div>
      </Tooltip>
    </div>
  );
}
