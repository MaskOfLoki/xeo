import { CardImageScreen } from './index';
import m from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import styles from './module.scss';
import cn from 'classnames';
import { isPreview } from '../../../../../../../common/utils/query';

export function template(this: CardImageScreen) {
  return (
    <div
      class={cn(styles.screen, {
        [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
        [styles.showChatroom]: this.showChatroom,
        [styles.noTitle]: isEmptyString(this.card.message),
      })}
    >
      <div class={styles.cardContents}>
        {!isEmptyString(this.card.message) && <div class={styles.message}>{this.card.message}</div>}
        <div
          class={styles.image}
          style={{
            backgroundImage: `url(${this.image})`,
          }}
          onclick={this.clickHandler.bind(this)}
        />
      </div>
      {this.card.socialShare && (!!navigator['share'] || isPreview()) && (
        <div class={styles.cardExtra}>
          {!(this.hasChannelVideo && this.showMediaContent) && (
            <div class={styles.message}>{this.card.socialMessage}</div>
          )}
          <div class={styles.shareButtonContainer}>
            <div class={styles.facebook} onclick={this.buttonShareHandler.bind(this)} />
            <div class={styles.twitter} onclick={this.buttonShareHandler.bind(this)} />
            <div class={styles.instagram} onclick={this.buttonShareHandler.bind(this)} />
          </div>
        </div>
      )}
    </div>
  );
}
