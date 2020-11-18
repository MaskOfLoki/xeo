import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { HomeSettingsPreview } from '../design/preview';
import { IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';
import { ConfigInput } from '../../../config-input';
import { DEFAULT_CONFIG, CardTypes } from '../../../../../../../common/common';
import { PointsSettings } from '.';
import { ConfigSlide } from '../../../config-slide';
import { Tooltip } from '../../../tooltip';

export function template(this: PointsSettings, { channel }: IChannelStateAttrs) {
  return (
    <div class={styles.container}>
      <div class={styles.mainPanel}>
        <div class={styles.pointsLabel}>POINTS</div>
        <div class={styles.mainContent}>
          <div class={styles.top}>
            <div class={styles.oneTimeActionLabel}>ONE-TIME ACTIONS</div>
            <div class={styles.createAccountCol}>
              <div class={styles.label}>Create Account</div>
              <ConfigInput
                configField='points.register'
                type='number'
                min='0'
                max='100000'
                defaultValue={DEFAULT_CONFIG.points.register}
                namespace={channel?.id}
              />
            </div>
            <div class={styles.checkInCol}>
              <div class={styles.label}>Check-In</div>
              <ConfigInput
                configField='points.checkin'
                type='number'
                min='0'
                max='100000'
                defaultValue={DEFAULT_CONFIG.points.checkin}
                namespace={channel?.id}
              />
            </div>
          </div>
          <div class={styles.divideLine}></div>
          <div class={styles.bottom}>
            <div class={styles.cardsLabel}>CARDS</div>
            <div class={styles.pointsPanel}>
              <div class={styles.left}>
                <button
                  class={cn(styles.reaction, { [styles.selected]: this.selected === CardTypes.REACTIONS })}
                  onclick={() => (this.selected = CardTypes.REACTIONS)}
                >
                  REACTIONS
                </button>
                <button
                  class={cn(styles.trivia_poll, { [styles.selected]: this.selected === CardTypes.TRIVIA_POLLS })}
                  onclick={() => (this.selected = CardTypes.TRIVIA_POLLS)}
                >
                  TRIVIA / POLL
                </button>
                <button
                  class={cn(styles.image_vid, { [styles.selected]: this.selected === CardTypes.IMAGE_VIDEO })}
                  onclick={() => (this.selected = CardTypes.IMAGE_VIDEO)}
                >
                  IMAGE / VIDEO
                </button>
                <div class={styles.cardsLabel}>ARCADE</div>
                <button
                  class={cn(styles.games, { [styles.selected]: this.selected === CardTypes.GAMES })}
                  onclick={() => (this.selected = CardTypes.GAMES)}
                >
                  GAMES
                </button>
              </div>
              <div class={styles.divide}></div>
              {this.selected === CardTypes.REACTIONS && (
                <div class={styles.right}>
                  <div class={styles.row}>
                    <div class={styles.thumbsIcon}></div>
                    <div class={styles.reactionLabel}>THUMBS</div>
                    <div class={styles.inputLabel}>Participation</div>
                    <div class={styles.inputWrapper}>
                      <ConfigInput
                        configField='points.thumbs'
                        type='number'
                        min='0'
                        max='99999'
                        defaultValue={DEFAULT_CONFIG.points.thumbs}
                        namespace={channel?.id}
                      />
                    </div>
                  </div>
                  <div class={styles.row}>
                    <div class={styles.sliderIcon}></div>
                    <div class={styles.reactionLabel}>SLIDER</div>
                    <div class={styles.inputLabel}>Participation</div>
                    <div class={styles.inputWrapper}>
                      <ConfigInput
                        configField='points.slider'
                        type='number'
                        min='0'
                        max='99999'
                        defaultValue={DEFAULT_CONFIG.points.slider}
                        namespace={channel?.id}
                      />
                    </div>
                  </div>
                  <div class={styles.row}>
                    <div class={styles.applauseIcon}></div>
                    <div class={styles.reactionLabel}>APPLAUSE</div>
                    <div class={styles.inputLabel}>Per Tap</div>
                    <div class={styles.inputWrapper}>
                      <ConfigInput
                        configField='points.applause'
                        type='number'
                        min='0'
                        max='99999'
                        defaultValue={DEFAULT_CONFIG.points.applause}
                        namespace={channel?.id}
                      />
                    </div>
                  </div>
                </div>
              )}
              {this.selected === CardTypes.TRIVIA_POLLS && (
                <div class={`${styles.right} ${styles.trivia_polls}`}>
                  <div class={styles.row}>
                    <div class={styles.pollIcon}></div>
                    <div class={styles.reactionLabel}>POLL</div>
                    <div class={styles.inputLabel}>Participation</div>
                    <Tooltip content='Correct trivia answer will give x10 points'>
                      <div class={styles.inputWrapper}>
                        <ConfigInput
                          configField='points.poll'
                          type='number'
                          min='0'
                          max='99999'
                          defaultValue={DEFAULT_CONFIG.points.poll}
                          namespace={channel?.id}
                        />
                      </div>
                    </Tooltip>
                  </div>
                </div>
              )}
              {this.selected === CardTypes.GAMES && (
                <div class={`${styles.right} ${styles.games}`}>
                  {this.games.map((game) => {
                    return (
                      <div class={styles.row}>
                        <div class={styles.gameIcon}></div>
                        <div class={styles.reactionLabel}>{game.name}</div>
                        <div class={`${styles.inputLabel} ${styles.gameLabel}`}>Enabled</div>
                        <div class={styles.inputWrapper}>
                          <ConfigSlide
                            configField={`points.enable-${game.id}`}
                            // defaultValue={DEFAULT_CONFIG.points.thumbs}
                            namespace={channel?.id}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div class={styles.previewPanel}>
        <HomeSettingsPreview channel={channel} />
      </div>
    </div>
  );
}
