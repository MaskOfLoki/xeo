import m from 'mithril';

import { CardIntegrationScreen } from '.';
import styles from './module.scss';
import { Button } from '../../../../components/button';
import cn from 'classnames';

export function template(this: CardIntegrationScreen) {
  return (
    <div
      class={cn(styles.screen, {
        [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
        [styles.showChatroom]: this.showChatroom,
      })}
    >
      {this.showChannelVideo && !this.isPlayed && (
        <div class={styles.image} style={{ backgroundImage: `url(${this.card.images?.backgroundImage})` }}>
          <div class={styles.parent}>
            <Button class={styles.buttonPlay} onclick={this.buttonPlayHandler.bind(this)}>
              PLAY NOW
            </Button>
            <div class={styles.icon} />
          </div>
        </div>
      )}
      {(!this.showChannelVideo || this.isPlayed) && <iframe class={styles.integration_frame} src={this.url}></iframe>}
      {/* <iframe class={styles.integration_frame} src={this.url}></iframe> */}
    </div>
  );
}
