import m from 'mithril';
import { EditTurboTrivia, PlayModes } from '.';
import styles from './module.scss';

export function template(this: EditTurboTrivia, { onchange }) {
  return (
    <div class={styles.controlWrapper}>
      <div class={styles.timersColumn}>
        <div class={styles.groupTimerInput}>
          <div class={styles.timerLabel}>Reveal Countdown</div>
          <div class={styles.groupTimer}>
            <input
              class='gc-input'
              type='number'
              max='99'
              min='0'
              value={this.revealCountDownMinutes.toString().padStart(2, '0')}
              oninput={(e) => {
                const value = parseInt(e.target.value);
                if (value || value === 0) {
                  this.revealCountDownMinutes = value;
                }
              }}
            />
            <span class={styles.semiLabel}>:</span>
            <input
              class='gc-input'
              type='number'
              max='59'
              min='0'
              value={this.revealCountDownSeconds.toString().padStart(2, '0')}
              oninput={(e) => {
                const value = parseInt(e.target.value);
                if (value || value === 0) {
                  this.revealCountDownSeconds = value;
                }
              }}
            />
          </div>
        </div>
        <div class={styles.groupTimerInput}>
          <div class={styles.timerLabel}>Intermission CountDown</div>
          <div class={styles.groupTimer}>
            <input
              class='gc-input'
              type='number'
              max='99'
              min='0'
              value={this.intermissionCountDownMinutes.toString().padStart(2, '0')}
              oninput={(e) => {
                const value = parseInt(e.target.value);
                if (value || value === 0) {
                  this.intermissionCountDownMinutes = value;
                }
              }}
            />
            <span class={styles.semiLabel}>:</span>
            <input
              class='gc-input'
              type='number'
              max='59'
              min='0'
              value={this.intermissionCountDownSeconds.toString().padStart(2, '0')}
              oninput={(e) => {
                const value = parseInt(e.target.value);
                if (value || value === 0) {
                  this.intermissionCountDownSeconds = value;
                }
              }}
            />
          </div>
        </div>
        <div class={styles.groupTimerInput}>
          <div class={styles.timerLabel}>Question Sets</div>
          <div class={styles.groupSelect}>
            <select class={styles.presetSelect} onchange={(e) => this.slotChangeHandler(e.target.value)}>
              {this.triviaSlots?.map((slot) => (
                <option value={slot.id} selected={slot.id == this.card?.slot}>
                  {slot.name ? slot.name : 'DEFAULT'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div class={styles.groupTimerInput}>
          <div class={styles.timerLabel}>Play Mode</div>
          <div class={styles.groupSelect}>
            <select class={styles.presetSelect} onchange={(e) => this.modeChangeHandler(e.target.value)}>
              {PlayModes.map((mode) => (
                <option value={mode.mode} selected={mode.mode == this.card?.mode}>
                  {mode.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div class={styles.adminEditor}>
          <button onclick={this.openAdmin.bind(this)}>Admin Editor</button>
        </div>
      </div>
    </div>
  );
}
