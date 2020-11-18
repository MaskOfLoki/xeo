import { WaitScreen } from './index';
import m from 'mithril';
import { config } from '../../../../services/ConfigService';
import { orientation } from '../../../../services/OrientationService';
import { isImageURL, isEmptyObject } from '../../../../../../../common/utils';
import { Video } from '../../../../../../../common/components/video';
import styles from './module.scss';
import cn from 'classnames';

export function template(this: WaitScreen) {
  if (isEmptyObject(config.home.wait)) {
    return;
  }

  let isImage = false;
  let url = '';

  if (orientation.isPortrait || this.isTimeline) {
    isImage = config.home.wait?.portrait ? isImageURL(config.home.wait.portrait) : false;
    url = config.home.wait.portrait;
  } else {
    isImage = config.home.wait?.landscape ? isImageURL(config.home.wait.landscape) : false;
    url = config.home.wait.landscape;
  }

  return (
    <div
      class={cn(styles.screen, { [styles.programmed]: this.isTimeline })}
      style={{
        backgroundImage: isImage ? `url(${url})` : '',
      }}
    >
      {!isImage && (
        <Video
          class={styles.video}
          src={url}
          muted
          autoplay
          loop
          style={{
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  );
}
