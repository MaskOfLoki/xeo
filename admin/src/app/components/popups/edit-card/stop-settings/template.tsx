import { StopSettings, IStopSettingsAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { CardStopMode } from '../../../../../../../common/common';

export function template(this: StopSettings, { disableCensus, disabled }: IStopSettingsAttrs) {
  return (
    <div class={cn(styles.control, { [styles.disabled]: disabled })}>
      <div class={styles.groupInput}>
        <button
          class={!this.card.stopMode ? 'selected' : 'outline'}
          onclick={() => (this.card.stopMode = CardStopMode.AUTO)}
        >
          AUTO
        </button>
        <div class={cn(styles.groupTimer, { [styles.disabled]: this.card.stopMode })}>
          <input
            class='gc-input'
            type='number'
            max='99'
            min='0'
            value={this.currentMinutes}
            oninput={(e) => {
              const value = parseInt(e.target.value);
              if ((value < 100 && value > -1) || e.target.value === '') {
                this.currentMinutes = e.target.value;
              } else {
                e.target.value = this.currentMinutes;
              }
            }}
            onblur={(e) => {
              if (parseInt(e.target.value)) {
                this.minutes = parseInt(e.target.value);
              } else {
                e.target.value = this.minutes.toString().padStart(2, '0');
              }
              this.currentMinutes = this.minutes.toString().padStart(2, '0');
            }}
          />
          <span class={styles.semiLabel}>:</span>
          <input
            class='gc-input'
            type='number'
            max='59'
            min='0'
            value={this.currentSeconds}
            oninput={(e) => {
              const value = parseInt(e.target.value);
              if ((value < 60 && value > -1) || e.target.value === '') {
                this.currentSeconds = e.target.value;
              } else {
                e.target.value = this.currentSeconds;
              }
            }}
            onblur={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                this.seconds = value;
              } else {
                e.target.value = this.seconds.toString().padStart(2, '0');
              }
              this.currentSeconds = this.seconds.toString().padStart(2, '0');
            }}
          />
        </div>
        <div class={styles.clockIcon} />
      </div>
      <div class={styles.groupInput}>
        <button
          class={this.card.stopMode === CardStopMode.MANUAL ? 'selected' : 'outline'}
          onclick={() => (this.card.stopMode = CardStopMode.MANUAL)}
        >
          MANUAL
        </button>
      </div>
      {!disableCensus && (
        <div class={styles.groupInput}>
          <button
            class={this.card.stopMode === CardStopMode.CENSUS ? 'selected' : 'outline'}
            onclick={() => (this.card.stopMode = CardStopMode.CENSUS)}
          >
            CENSUS
          </button>
          <div
            class={cn(styles.groupCensus, {
              [styles.disabled]: this.card.stopMode !== CardStopMode.CENSUS,
            })}
          >
            <input
              class='gc-input'
              type='number'
              min='1'
              value={this.card.stopCensus}
              oninput={(e) => (this.card.stopCensus = parseInt(e.target.value))}
            />
          </div>
          <div class={styles.userIcon} />
        </div>
      )}
    </div>
  );
}
