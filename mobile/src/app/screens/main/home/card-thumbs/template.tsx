import { CardThumbsScreen } from './index';
import m from 'mithril';
import cn from 'classnames';
import styles from './module.scss';
import { MobilePreviewMode } from '../../../../../../../common/common';
import { getPreviewMode, isPreview } from '../../../../../../../common/utils/query';

export function template(this: CardThumbsScreen) {
  return (
    <div
      class={cn(styles.screen, {
        [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
        [styles.showChatroom]: this.showChatroom,
      })}
    >
      <div class={styles.header}>{this.card.header}</div>
      <div class={styles.message}>{this.card.message}</div>

      <div class={styles.buttonGroup}>
        <div
          class={cn(styles.button, styles.buttonUp, {
            [styles.disabled]: this.isUp != null,
          })}
          style={{ backgroundImage: `url(${this.card.images.up})` }}
          onclick={this.buttonUpHandler.bind(this)}
        >
          {this.isUp === true && <div class={cn(styles.selected)} />}
        </div>
        <div
          class={cn(styles.button, styles.buttonDown, {
            [styles.disabled]: this.isUp != null,
          })}
          style={{ backgroundImage: `url(${this.card.images.down})` }}
          onclick={this.buttonDownHandler.bind(this)}
        >
          {this.isUp === false && <div class={cn(styles.selected)} />}
        </div>
      </div>
      {!(isPreview() && getPreviewMode() == MobilePreviewMode.CARD) && (
        <div class={styles.percentBarWrapper}>
          <div class={styles.percentTitle}>
            <span class={styles.percent}>{this.percentage != null ? this.percentage : 0}%</span> Agree
          </div>
          <div class={styles.percentBar}>
            <div class={styles.bar} style={`width: ${this.percentage != null ? this.percentage : 0}%;`} />
          </div>
        </div>
      )}
    </div>
  );
}
