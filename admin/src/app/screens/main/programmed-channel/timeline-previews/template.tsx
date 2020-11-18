import { TimelinePreviews, ITimelinePreviewsAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { TimelinePreviewsHeader } from './header';
import { Video } from '../../../../../../../common/components/video';
import { MobilePreview } from '../../../../components/mobile-preview';
import { MobilePreviewMode } from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import { BannerControls } from '../../realtime-channel/online-channel-controls/banner-controls';
import { Slide } from '../../../../components/slide';

export function template(this: TimelinePreviews, { channel, onduration }: ITimelinePreviewsAttrs) {
  return (
    <div class={styles.control}>
      <div class={styles.headerrow}>
        <TimelinePreviewsHeader />
        <Slide selected={this.showMediaContent} onchange={this.showMediaChangeHandler.bind(this)}></Slide>
        <span class={styles.slideLabel}>Media Content</span>
      </div>
      <div class={styles.row}>
        <MobilePreview
          class={styles.mobilePreview}
          channelId={channel.id}
          mode={MobilePreviewMode.EVENT}
          ref={this.mobilePreviewReadyHandler.bind(this)}
        />
        {channel.media && (
          <div class={styles.groupVideo}>
            <Video
              class={styles.video}
              src={channel.media}
              ref={this.videoReadyPlayerHandler.bind(this)}
              onduration={onduration}
              muted={true}
              autoplay={false}
              wowza={api}
            />
          </div>
        )}
      </div>
      <div class={styles.bannerRow}>
        <BannerControls channel={channel}></BannerControls>
      </div>
    </div>
  );
}
