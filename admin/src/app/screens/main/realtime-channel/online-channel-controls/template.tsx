import { OnlineChannelControls } from './index';
import styles from './module.scss';
import m from 'mithril';
import { MainboardControls } from './mainboard-controls';
import { BannerControls } from './banner-controls';
import { Participation } from './participation';
import { MainboardPreview } from '../../../../components/mainboard-preview';
import { MobilePreview } from '../../../../components/mobile-preview';
import { MobilePreviewMode, MainboardPreviewMode } from '../../../../../../../common/common';
import { Slide } from '../../../../components/slide';
import cn from 'classnames';
import { ChannelMedia } from './channel-media';

export function template(this: OnlineChannelControls) {
  return (
    <div class={styles.control}>
      <div class={styles.row}>
        <div class={cn(styles.column, styles.full)}>
          <div class={styles.title}>
            <span class={styles.mainboardTitle}>Mainboard</span>
            <Slide selected={this.showLiveResponses} onchange={this.showLiveResponsesChangeHandler.bind(this)}></Slide>
            <span class={styles.slideLabel}>Live Responses</span>
            <Slide selected={this.showMediaContent} onchange={this.showMediaChangeHandler.bind(this)}></Slide>
            <span class={styles.slideLabel}>Media Content</span>
            <div class={styles.menuBtn} onclick={this.menuBtnClickHandler.bind(this)}></div>
          </div>
          <div class={styles.groupMainboard}>
            <MainboardPreview
              class={styles.mainboardPreview}
              channelId={this.channel.id}
              mode={MainboardPreviewMode.EVENT}
            ></MainboardPreview>
            <div class={cn(styles.channelMediaContainer, { [styles.hide]: !this.showMediaContent })}>
              <ChannelMedia channel={this.channel} />
            </div>
          </div>
        </div>
      </div>
      <div class={styles.secondRow}>
        <MobilePreview mode={MobilePreviewMode.EVENT} channelId={this.channel.id} />
        <div class={styles.column}>
          <MainboardControls channel={this.channel} />
          <BannerControls channel={this.channel} />
          <Participation channel={this.channel} />
        </div>
      </div>
    </div>
  );
}
