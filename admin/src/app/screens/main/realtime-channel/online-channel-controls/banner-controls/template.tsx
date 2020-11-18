import { BannerControls } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';

export function template(this: BannerControls) {
  return (
    <div class={styles.control}>
      <div class={styles.title}>Mobile Banner</div>
      <button
        class={cn({ outline: !this.showMarketingMessages })}
        onclick={this.toggleShowMarketingMessages.bind(this, true)}
      >
        MARKETING
      </button>
      <button
        class={cn({ outline: this.showMarketingMessages })}
        onclick={this.toggleShowMarketingMessages.bind(this, false)}
      >
        LIVE RESPONSES
      </button>
    </div>
  );
}
