import { CardApplauseScreen } from './index';
import m from 'mithril';
import styles from './module.scss';
import { getPreviewMode, isPreview } from '../../../../../../../common/utils/query';
import { MobilePreviewMode } from '../../../../../../../common/common';
import { CountUp } from '../../../../../../../common/utils/CountUp';
import cn from 'classnames';
import { isIOS } from '@gamechangerinteractive/xc-backend/utils';

export function template(this: CardApplauseScreen) {
  const clapIconStyle: Partial<CSSStyleDeclaration> = {};
  const clapButtonStyle: Partial<CSSStyleDeclaration> = {};
  const smallClapIconStyle: Partial<CSSStyleDeclaration> = {};

  if (this.card.images?.clap) {
    clapIconStyle['mask-image'] = clapIconStyle['-webkit-mask-image'] = 'none';
    clapIconStyle.backgroundColor = 'transparent';
    clapIconStyle.backgroundImage = `url(${this.card.images.clap})`;
    smallClapIconStyle['mask-image'] = clapIconStyle['-webkit-mask-image'] = 'none';
    smallClapIconStyle.backgroundColor = 'transparent';
    smallClapIconStyle.backgroundImage = `url(${this.card.images.clap})`;
    clapIconStyle.width = '100%';
    clapIconStyle.height = '100%';
    clapIconStyle.top = '0';
    clapIconStyle.left = '0';
  } else if (this.card.colors?.clapIcon) {
    clapIconStyle.background = this.card.colors.clapIcon;
    smallClapIconStyle.background = this.card.colors.clapIcon;
  }

  if (this.card.images?.clap) {
    clapButtonStyle.background = '';
  } else if (this.card.colors?.clapBackground) {
    clapButtonStyle.background = this.card.colors?.clapBackground?.toString();
  }

  const tapAttrs = {
    [isIOS() ? 'ontouchstart' : 'onclick']: this.clickHandler.bind(this),
  };

  return (
    <div
      class={cn(styles.screen, {
        [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
        [styles.showChatroom]: this.showChatroom,
      })}
    >
      <div class={styles.cardContents}>
        <div class={styles.cardText}>
          <div class={styles.header}>{this.card.header}</div>
          <div class={styles.message}>{this.card.message}</div>
        </div>
        <div
          class={styles.button}
          style={
            {
              // background: this.card.images.clap ? '' : this.card.colors?.clapBackground,
            }
          }
          {...tapAttrs}
        >
          <div class={styles.clap} style={clapIconStyle}></div>
        </div>
      </div>
      {!(isPreview() && getPreviewMode() == MobilePreviewMode.CARD) && (
        <div class={styles.cardData}>
          <div class={styles.handClaps} />
          <CountUp value={this.totalClaps}>
            <span id={styles.totalClaps} style={{ color: this.card.colors?.text }}></span>
          </CountUp>
        </div>
      )}
    </div>
  );
}
