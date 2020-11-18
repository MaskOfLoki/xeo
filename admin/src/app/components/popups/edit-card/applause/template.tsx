import { EditApplause } from './index';
import styles from './module.scss';
import m from 'mithril';
import { QuickAddThumbs } from '../../../quick-add/thumbs';
import { PresetsSelect } from '../../../presets-select';
import { CardType } from '../../../../../../../common/common';
import { ColorPicker } from '../../../color-picker';
import { FileUpload } from '../../../file-upload';

export function template(this: EditApplause, { onchange }) {
  const defaultColors = this.defaultColors();
  return (
    <div class={styles.controlWrapper}>
      <div class={styles.quickAddColumn}>
        <QuickAddThumbs
          card={this.card}
          onchange={this._onchange}
          ref={(value) => (this.quickAddComponent = value)}
          channel={this._channel}
        />
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
      <div class={styles.rowLabel}>
        <div class={styles.color}>Color</div>
        <div class={styles.image}>Image</div>
      </div>
      <div class={styles.row}>
        <div class={styles.color}>
          <ColorPicker
            label='Background'
            color={this.card.colors?.background ?? this.config.home.colors.background}
            gradient={true}
            onchange={(color) => {
              this.card.colors.background = color;
              onchange();
            }}
            candelete={this.card.colors?.background}
            ondelete={() => {
              delete this.card.colors.background;
              this._onchange();
            }}
          />
        </div>
        <div class={styles.image}>
          <FileUpload
            value={this.card.images?.background}
            onchange={(value) => {
              this.card.images.background = value;
              onchange();
            }}
          />
        </div>
      </div>
      <div class={styles.row}>
        <div class={styles.color}>
          <ColorPicker
            label='Text Color'
            color={this.card.colors?.text ?? this.config.home.colors.text}
            onchange={(color) => {
              this.card.colors.text = color;
              onchange();
            }}
            candelete={this.card.colors?.text && this.card.colors.text !== this.config.home.colors.text}
            ondelete={() => {
              delete this.card.colors.text;
              this._onchange();
            }}
          />
        </div>
        <div class={styles.image}></div>
      </div>
      <div class={styles.row}>
        <div class={styles.color}>
          <ColorPicker
            label='Clap Icon Color'
            color={this.card.colors.clapIcon ?? defaultColors.clapIcon}
            gradient={true}
            onchange={(color) => {
              this.card.colors.clapIcon = color;
              onchange();
            }}
            candelete={this.card.colors.clapIcon != defaultColors.clapIcon}
            ondelete={() => {
              this.card.colors.clapIcon = defaultColors.clapIcon;
              onchange();
            }}
          />
        </div>
        <div class={styles.image}>
          <FileUpload
            value={this.card.images?.clap}
            onchange={(value) => {
              this.card.images.clap = value;
              onchange();
            }}
          />
        </div>
      </div>
      <div class={styles.row}>
        <div class={styles.color}>
          <ColorPicker
            label='Clap Background Color'
            color={this.card.colors?.clapBackground ?? defaultColors.clapBackground}
            gradient={true}
            onchange={(color) => {
              this.card.colors.clapBackground = color;
              onchange();
            }}
            candelete={this.card.colors.clapBackground}
            ondelete={() => {
              delete this.card.colors.clapBackground;
              onchange();
            }}
          />
        </div>
        <div class={styles.image}></div>
      </div>
    </div>
  );
}
