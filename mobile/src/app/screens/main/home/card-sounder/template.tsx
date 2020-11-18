import { CardSounderScreen } from './index';
import m from 'mithril';
import { Button } from '../../../../components/button';
import { CardType, DEFAULT_CONFIG } from '../../../../../../../common/common';
import { config } from '../../../../services/ConfigService';
import cn from 'classnames';
import styles from './module.scss';
import { isIOS } from '@gamechangerinteractive/xc-backend/utils';
import { convertHexToRGBA } from '../../../../../../../common/utils';

export function template(this: CardSounderScreen) {
  return (
    this.card.type === CardType.SOUNDER && (
      <div
        class={cn(styles.screen, {
          [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
          [styles.showChatroom]: this.showChatroom,
        })}
      >
        <div class={styles.message}>{this.card?.message}</div>
        <div class={styles.buttonWrapper}>
          {this.isMicMode && (
            <div class={styles.countdown}>
              <div
                class={styles.micBackground}
                style={{
                  background: `radial-gradient(circle, 
                    ${convertHexToRGBA(config.home.colors.primary.foreground as string, 0.98)} -10%, transparent 50%)`,
                }}
              >
                <div class={styles.micButtonSound} />
              </div>
              <svg class={styles.progress} viewBox='0 0 120 120'>
                <filter id='neon'>
                  <feFlood flood-color='#02edfe' flood-opacity='0.5' in='SourceGraphic' />
                  <feComposite operator='in' in2='SourceGraphic' />
                  <feGaussianBlur stdDeviation='2' />
                  <feComponentTransfer result='glow1'>
                    <feFuncA type='linear' slope='2' intercept='0' />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode in='glow1' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>
                <circle class={styles.progressMeter} cx='60' cy='60' r='54' stroke-width='8' />
                <circle
                  class={styles.progressValue}
                  cx='60'
                  cy='60'
                  r='54'
                  stroke-width='8'
                  filter='url(#neon)'
                  stroke={config.home.colors.primary.foreground}
                />
              </svg>
            </div>
          )}
          {!this.isMicMode &&
            this.card.sounds.map((sound, index) => {
              if (sound.name === 'Make Some Noise') {
                return null;
              }

              const tapAttrs = {
                [isIOS() ? 'ontouchstart' : 'onclick']: this.buttonHandler.bind(this, index),
              };

              return (
                <Button outline={true} disabled={false} {...tapAttrs}>
                  <div
                    class={styles.icon}
                    style={{
                      ...getSoundIconStyle(sound.image),
                      background: this.card.colors.icon,
                    }}
                  />
                  <div class={styles.label}>{sound.name}</div>
                </Button>
              );
            })}
        </div>
        <div
          class={styles.micRow}
          style={this.hasChannelVideo && this.showMediaContent && { background: config.home.colors.levels[4] }}
        >
          <div class={styles.micWrapper}>
            <div
              class={cn(styles.micIcon, { [styles.micButton]: !this.isMicMode })}
              style={{
                backgroundColor:
                  this.card.colors.button ?? config.home.colors.button ?? DEFAULT_CONFIG.home.colors.button,
              }}
              onclick={() => this.toggleMicMode()}
            />
          </div>
          <div class={styles.sounderbarWrapper}>
            <div class={styles.soundbar}>
              <div class={styles.bar} style={`width: ${this.sounderbarPercent}%;`} />
            </div>
            <div
              class={styles.soundbarBg}
              style={{
                borderColor: config.home.colors.primary.background,
                background: `radial-gradient( 
                ${convertHexToRGBA(config.home.colors.primary.background as string, 0.2)}, transparent)`,
              }}
            >
              {[...Array(20).keys()].map(() => (
                <div
                  class={styles.soundbarSection}
                  style={{ background: convertHexToRGBA(config.home.colors.primary.background as string, 0.2) }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  );
}

function getSoundIconStyle(url: string) {
  url = `url(${url})`;

  return {
    'mask-image': url,
    '-webkit-mask-image': url,
  };
}
