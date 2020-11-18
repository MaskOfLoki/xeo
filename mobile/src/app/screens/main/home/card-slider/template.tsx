import { CardSliderScreen } from './index';
import m from 'mithril';
import cn from 'classnames';
import { CardType } from '../../../../../../../common/common';
import styles from './module.scss';
import { config } from '../../../../services/ConfigService';

export function template(this: CardSliderScreen) {
  return (
    this.card.type === CardType.REACTION_SLIDER && (
      <div
        class={cn(styles.screen, {
          [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
          [styles.showChatroom]: this.showChatroom,
        })}
      >
        <div class={styles.labelWrapper}>
          <div class={styles.cardLabel}>{this.topLabel}</div>
        </div>
        <div class={styles.groupWrapper}>
          <div class={styles.groupIcon}>
            <div
              class={styles.icon}
              style={{
                backgroundImage: `url(assets/images/cards/slider/${this.imageIndex}.png)`,
              }}
            />
          </div>
          <div class={styles.sliderStateLabel} style={{ color: config.home?.colors?.correct?.foreground }}>
            {this.topLabel}
          </div>
          <div class={styles.slider}>
            <div class={styles.siderBar}>
              <div class={styles.bar} style={{ backgroundColor: config.home?.colors?.sentiment?.[1] }} />
              <div class={styles.bar} style={{ backgroundColor: config.home?.colors?.sentiment?.[2] }} />
              <div class={styles.bar} style={{ backgroundColor: config.home?.colors?.sentiment?.[3] }} />
              <div class={styles.bar} style={{ backgroundColor: config.home?.colors?.sentiment?.[4] }} />
              <div class={styles.bar} style={{ backgroundColor: config.home?.colors?.sentiment?.[5] }} />
            </div>
          </div>
          {this.percentageList.length > 0 && (
            <div class={styles.percentWrapper}>
              {this.card.labels.map((_, index) => (
                <div class={styles.item}>
                  <div class={styles.pointer} />
                  <div class={styles.percentValue} styl={{ color: config.home?.colors?.primary.foreground }}>
                    {this.percentage(index)} <span class={styles.percent}>%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  );
}
