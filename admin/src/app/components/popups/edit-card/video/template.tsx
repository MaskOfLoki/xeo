import { EditVideo } from './index';
import styles from './module.scss';
import m from 'mithril';
import { Input } from '../../../input';
import { MAX_MESSAGE } from '../../../../utils';
import { Tooltip } from '../../../tooltip';
import { STREAM_PLATFORMS_NAMES } from '../../../../../../../common/types/EmbeddedVideo';
import { Slide } from '../../../slide';
import { FileUpload } from '../../../file-upload';
import { PresetsSelect } from '../../../presets-select';
import { CardType, IRTMPStream } from '../../../../../../../common/common';
import { ColorPicker } from '../../../color-picker';

export function template(this: EditVideo) {
  return (
    <div class={styles.controlWrapper}>
      <div class={styles.quickAddColumn}>
        <div class={styles.control}>
          <Input
            placeholder='Message'
            maxlength={MAX_MESSAGE}
            value={this.card.message}
            oninput={(e) => {
              this.card.message = e.target.value;
              this._onchange();
            }}
          />
          {this.isStream && (
            <Tooltip content={STREAM_PLATFORMS_NAMES}>
              <Input
                placeholder='Stream URL'
                value={this.streamUrl}
                oninput={(e) => {
                  this.streamUrl = e.target.value;
                  this._onchange();
                }}
              />
            </Tooltip>
          )}
        </div>
        <Slide selected={this.card.socialShare} onchange={(value) => (this.card.socialShare = value)}>
          Show Social Media Options
        </Slide>
        <Slide selected={this.card.autoStart} onchange={(value) => (this.card.autoStart = value)}>
          Auto Start
        </Slide>
        <Slide selected={this.card.loop} onchange={(value) => (this.card.loop = value)}>
          Loop
        </Slide>
        <Slide selected={this.card.hideControls} onchange={this.changeHideControls.bind(this)}>
          Hide Controls
        </Slide>
        <Tooltip content={STREAM_PLATFORMS_NAMES}>
          <Slide selected={this.isStream} onchange={(value) => this.isStreamChangeHandler(value)}>
            Stream
          </Slide>
        </Tooltip>
        {this.streams.length > 0 && (
          <Slide selected={this.isRTMP} onchange={this.isRTMPChangeHandler.bind(this)}>
            RTMP Stream
          </Slide>
        )}
        {this.isRTMP && (
          <div>
            <div class={styles.label}>Choose Stream</div>
            <select>
              {this.streams.map((stream) => (
                <option selected={(this.card.video as IRTMPStream).id === stream.id}>{stream.name}</option>
              ))}
            </select>
          </div>
        )}
        {!this.isStream && !this.isRTMP && (
          <div class={styles.imageRow}>
            <div class={styles.imageInputWrapper}>
              <FileUpload
                type='video'
                value={this.card.video}
                maxsize='100'
                onchange={(video) => {
                  this.card.video = video;
                  this._onchange();
                }}
              />
            </div>
            <div class={styles.imageLabel}>VIDEO</div>
            <div class={styles.underSizeLabel}>Under 100 MB</div>
          </div>
        )}
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
          <div class={styles.rowText}>Background</div>
          <div class={styles.color}>
            <ColorPicker
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
      </div>
      <div class={styles.row}>
        <div class={styles.column}>
          <div class={styles.rowText}>Text Color</div>
          <div class={styles.color}>
            <ColorPicker
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
