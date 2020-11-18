import m from 'mithril';
import { EditFanFilterCam } from '.';
import styles from './module.scss';
import { Toggle } from '../../../toggle';
import { PresetsSelect } from '../../../presets-select';
import { CardType } from '../../../../../../../common/common';
import { FileUpload } from '../../../file-upload';

export function template(this: EditFanFilterCam, { onchange }) {
  return (
    <div class={styles.controlWrapper}>
      <div class={styles.filtersColumn}>
        <div class={styles.timerLabel}>Filters</div>
        <div class={styles.groupFilters}>
          <Toggle
            type='checkbox'
            selected={this.card.filters.emoji}
            onchange={(value) => (this.card.filters.emoji = value)}
          >
            Emoji
          </Toggle>
          <Toggle
            type='checkbox'
            selected={this.card.filters.animal}
            onchange={(value) => (this.card.filters.animal = value)}
          >
            Animal
          </Toggle>
          {this.isHam && (
            <Toggle
              type='checkbox'
              selected={!!this.card.filters.custom.ham}
              onchange={(value) => {
                if (value) {
                  this.card.filters.custom.ham = {
                    title: 'Ham Fighter Filters',
                    url: '',
                  };
                } else {
                  delete this.card.filters.custom.ham;
                }
              }}
            >
              Ham Fighters
            </Toggle>
          )}
        </div>
      </div>
      <div class={styles.divideLine}></div>
      <div class={styles.presetSelectWrapper}>
        <PresetsSelect
          type={`design-card-${this.card.type}`}
          data={{
            images: this.card.images,
          }}
          onchange={(data) => {
            this.card.images = data.images ?? {};
            this._onchange();
          }}
          disabled={this.card.type === CardType.REACTION_SLIDER}
        />
      </div>
      <div class={styles.divideLine}></div>
      <div class={styles.row}>
        <div class={styles.imageUpload}>
          <FileUpload
            title='Mainboard Image'
            value={this.card.images.mainboard}
            onchange={(value) => {
              this.card.images.mainboard = value;
              onchange();
            }}
          />
        </div>
      </div>
      <div class={styles.row}>
        <div class={styles.imageUpload}>
          <FileUpload
            title='Sponsor Overlay (Portrait)'
            value={this.card.images.sponsorPortrait}
            onchange={(value) => {
              this.card.images.sponsorPortrait = value;
              onchange();
            }}
          />
        </div>
        <div class={styles.imageUpload}>
          <FileUpload
            title='Sponsor Overlay (Landscape)'
            value={this.card.images.sponsorLandscape}
            onchange={(value) => {
              this.card.images.sponsorLandscape = value;
              onchange();
            }}
          />
        </div>
      </div>
    </div>
  );
}
