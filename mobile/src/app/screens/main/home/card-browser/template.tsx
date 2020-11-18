import m from 'mithril';
import cn from 'classnames';
import { CardBrowserScreen } from './index';
import styles from './module.scss';

export function template(this: CardBrowserScreen) {
  const showFrame = !this.card.clickable || this.clicked;

  return (
    <div class={cn(styles.cardBrowser, { [styles.scrollable]: showFrame && this.card.scrollEnabled })}>
      {!showFrame && (
        <div class={styles.preloading} onclick={() => this.clickCard()}>
          {!this.card.imageOnly && <div class={styles.headline}>{this.card.headline}</div>}
          {!this.card.imageOnly && <div class={styles.subheadline}>{this.card.subheadline}</div>}
          <div class={styles.image} style={{ backgroundImage: `url(${this.card.image?.url})` }} />
        </div>
      )}
      <iframe src={this.card.url} class={cn(styles.iframe, { [styles.visible]: showFrame })} />
    </div>
  );
}
