import { EditSounder } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { Tooltip } from '../../../tooltip';
import { Input } from '../../../input';
import { MAX_MESSAGE, MAX_ANSWER } from '../../../../utils';
import { Slide } from '../../../slide';
import { FileUpload } from '../../../file-upload';
import { PresetsSelect } from '../../../presets-select';
import { CardType } from '../../../../../../../common/common';
import { ColorPicker } from '../../../color-picker';

export function template(this: EditSounder) {
  const defaultColors = this.defaultColors();
  return (
    <div class={styles.controlWrapper}>
      <div class={styles.quickAddColumn}>
        <Tooltip content='Sub Headline'>
          <Input
            placeholder='Sub Headline'
            maxlength={MAX_MESSAGE}
            value={this.card.message}
            oninput={(e) => {
              this.card.message = e.target.value;
              this._onchange();
            }}
          />
        </Tooltip>

        <Tooltip content='Broadcasting Delay in seconds'>
          <Input
            class={styles.inputDelay}
            type='number'
            placeholder='Delay'
            min='0'
            value={this.card.delay}
            oninput={(e) => (this.card.delay = parseInt(e.target.value))}
          />
        </Tooltip>
      </div>
      <div class={styles.divideLine}></div>
      <div class={styles.soundButtons}>
        {this.card.sounds.map((_, index) => (
          <button
            class={cn(styles.soundButton, {
              selected: this.selectedSound === index,
              outline: this.selectedSound !== index,
            })}
            onclick={this.soundButtonClickHandler.bind(this, index)}
          >
            SOUND {index}
          </button>
        ))}
        <button
          class={cn('outline', styles.soundAddButton, { hide: this.card.sounds.length >= 5 })}
          onclick={this.buttonAddHandler.bind(this)}
        >
          +
        </button>
      </div>
      <div class={styles.soundPanels}>
        {this.card.sounds.map((sound, index) => (
          <div class={styles.soundPanel + ' ' + (index != this.selectedSound ? styles.hide : '')}>
            <div class={styles.muteRow}>
              <div class={styles.muteWrapper}>
                <span class={styles.muteMobileLabel}>Mute Mobile</span>
                <Slide selected={this.card.muteMobile} onchange={(value) => (this.card.muteMobile = value)}></Slide>
              </div>
              <div class={styles.deleteSound}>
                {this.card.sounds.length > 2 && (
                  <button onclick={this.buttonDeleteHandler.bind(this, index)}>DELETE SOUND</button>
                )}
              </div>
            </div>
            <div class={styles.soundInputRow}>
              <div class={styles.selectedSound}>
                <div class={styles.selectedSoundName}>
                  <Input
                    label='Selected Sound'
                    value={sound.name}
                    maxlength={MAX_ANSWER - 5}
                    readonly={sound.name == 'Make Some Noise'}
                    oninput={(e) => {
                      if (sound.name != 'Make Some Noise') {
                        this.card.sounds[this.selectedSound].name = e.target.value;
                        this._onchange();
                      }
                    }}
                  />
                </div>
                <div class={styles.selectedSoundImage}>
                  <FileUpload
                    type='sound'
                    value={sound.url}
                    onchange={(url) => {
                      this.card.sounds[this.selectedSound].url = url;
                      this._onchange();
                    }}
                  />
                </div>
              </div>
              <div class={styles.soundImage}>
                <div class={styles.soundImageLabel}>Sound Image</div>
                <div class={styles.soundImageInput}>
                  <FileUpload
                    value={sound.image}
                    onchange={(image) => {
                      this.card.sounds[this.selectedSound].image = image;
                      this._onchange();
                    }}
                  />
                </div>
              </div>
            </div>
            {!isEmptyString(sound.url) && (
              <div class={styles.soundControlRow}>
                <audio src={sound.url} controls loop preload />
              </div>
            )}
          </div>
        ))}
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
      <div class={styles.row}>
        <div class={styles.column}>
          <div class={styles.color}>
            <ColorPicker
              label='Background'
              color={this.card.colors.background ?? this.config.home.colors.background}
              gradient={true}
              candelete={
                this.card.colors.background && this.card.colors.background !== this.config.home.colors.background
              }
              ondelete={() => {
                delete this.card.colors.background;
                this._onchange();
              }}
              onchange={(color) => {
                this.card.colors.background = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.image}>
            <FileUpload
              value={this.card.images?.background}
              onchange={(value) => {
                this.card.images.background = value;
                this._onchange();
              }}
            />
          </div>
        </div>
        <div class={styles.column}>
          <div class={styles.color}>
            <ColorPicker
              label='Button Color'
              color={this.card.colors.button ?? this.config.home.colors.button}
              gradient={true}
              candelete={this.card.colors.button && this.card.colors.button !== this.config.home.colors.button}
              ondelete={() => {
                delete this.card.colors.button;
                this._onchange();
              }}
              onchange={(color) => {
                this.card.colors.button = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.image}></div>
        </div>
        <div class={styles.column}>
          <div class={styles.color}>
            <ColorPicker
              label='Icon Color'
              color={this.card.colors.icon ?? defaultColors.icon}
              gradient={true}
              candelete={this.card.colors.icon !== defaultColors.icon}
              ondelete={() => {
                this.card.colors.icon = defaultColors.icon;
                this._onchange();
              }}
              onchange={(color) => {
                this.card.colors.icon = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.image}></div>
        </div>
      </div>
      <div class={styles.row}>
        {/* <div class={styles.column}>
          <div class={styles.color}>
            <ColorPicker
              label='Header Color'
              color={this.card.colors.header ?? defaultColors.header}
              gradient={true}
              candelete={this.card.colors.header !== defaultColors.header}
              ondelete={() => {
                this.card.colors.header = defaultColors.header;
                this._onchange();
              }}
              onchange={(color) => {
                this.card.colors.header = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.image}></div>
        </div> */}
        <div class={styles.column}>
          <div class={styles.color}>
            <ColorPicker
              label='Text Color'
              color={this.card.colors.text ?? this.config.home.colors.text}
              candelete={this.card.colors.text && this.card.colors.text !== this.config.home.colors.text}
              ondelete={() => {
                delete this.card.colors.text;
                this._onchange();
              }}
              onchange={(color) => {
                this.card.colors.text = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.image}></div>
        </div>
      </div>
    </div>
  );
}
