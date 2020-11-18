import m from 'mithril';
import { EditTugOfWar } from '.';
import styles from './module.scss';
import { PresetsSelect } from '../../../presets-select';
import { CardType } from '../../../../../../../common/common';
import { ColorPicker } from '../../../color-picker';
import { FileUpload } from '../../../file-upload';

export function template(this: EditTugOfWar, { onchange }) {
  return (
    <div class={styles.controlWrapper}>
      <div class={styles.timersColumn}>
        <div class={styles.groupTimerInput}>
          <div class={styles.timerLabel}>Splash Screen Countdown</div>
          <div class={styles.groupTimer}>
            <input
              class='gc-input'
              type='number'
              max='99'
              min='0'
              value={this.splashScreenMinutes.toString().padStart(2, '0')}
              oninput={(e) => {
                const value = parseInt(e.target.value);
                if (value || value === 0) {
                  this.splashScreenMinutes = value;
                }
              }}
            />
            <span class={styles.semiLabel}>:</span>
            <input
              class='gc-input'
              type='number'
              max='59'
              min='0'
              value={this.splashScreenSeconds.toString().padStart(2, '0')}
              oninput={(e) => {
                const value = parseInt(e.target.value);
                if (value || value === 0) {
                  this.splashScreenSeconds = value;
                }
              }}
            />
          </div>
        </div>
        <div class={styles.groupTimerInput}>
          <div class={styles.timerLabel}>Game Start Countdown</div>
          <div class={styles.groupTimer}>
            <input
              class='gc-input'
              type='number'
              max='99'
              min='0'
              value={this.gameStartMinutes.toString().padStart(2, '0')}
              oninput={(e) => {
                const value = parseInt(e.target.value);
                if (value || value === 0) {
                  this.gameStartMinutes = value;
                }
              }}
            />
            <span class={styles.semiLabel}>:</span>
            <input
              class='gc-input'
              type='number'
              max='59'
              min='0'
              value={this.gameStartSeconds.toString().padStart(2, '0')}
              oninput={(e) => {
                const value = parseInt(e.target.value);
                if (value || value === 0) {
                  this.gameStartSeconds = value;
                }
              }}
            />
          </div>
        </div>
      </div>
      <div class={styles.divideLine}></div>
      <div class={styles.presetSelectWrapper}>
        <PresetsSelect
          type={`design-card-${this.card.type}`}
          data={{
            colors: this.card.colors,
            images: this.card.images,
          }}
          onchange={(data) => {
            this.card.images = data.images ?? {};
            this.card.colors = data.colors ?? {};
            this._onchange();
          }}
          disabled={this.card.type === CardType.REACTION_SLIDER}
        />
      </div>
      <div class={styles.divideLine}></div>
      <div class={styles.row}>
        <div class={styles.color}>
          <ColorPicker
            label='Primary'
            color={this.card.colors?.primary ?? this.config.home.colors.background}
            gradient={true}
            onchange={(color) => {
              this.card.colors.primary = color;
              onchange();
            }}
            candelete={this.card.colors?.primary}
            ondelete={() => {
              delete this.card.colors.primary;
              this._onchange();
            }}
          />
        </div>
        <div class={styles.imageUpload}>
          <FileUpload
            title='Background Image'
            value={this.card.images?.backgroundImage}
            onchange={(value) => {
              this.card.images.backgroundImage = value;
              onchange();
            }}
          />
        </div>
      </div>
      <div class={styles.row}>
        <div class={styles.color}>
          <ColorPicker
            label='Secondary'
            color={this.card.colors?.secondary ?? this.config.home.colors.accent}
            gradient={true}
            onchange={(color) => {
              this.card.colors.secondary = color;
              onchange();
            }}
            candelete={this.card.colors?.secondary}
            ondelete={() => {
              delete this.card.colors.secondary;
              this._onchange();
            }}
          />
        </div>
      </div>
      <div class={styles.row}>
        <div class={styles.color}>
          <ColorPicker
            label='Text'
            color={this.card.colors?.text ?? this.config.home.colors.text}
            gradient={true}
            onchange={(color) => {
              this.card.colors.text = color;
              onchange();
            }}
            candelete={this.card.colors?.text}
            ondelete={() => {
              delete this.card.colors.text;
              this._onchange();
            }}
          />
        </div>
        <div class={styles.imageUpload}>
          <FileUpload
            title='Sponsor Logo'
            value={this.card.images?.sponsorLogo}
            onchange={(value) => {
              this.card.images.sponsorLogo = value;
              onchange();
            }}
          />
        </div>
      </div>
    </div>
  );
}
