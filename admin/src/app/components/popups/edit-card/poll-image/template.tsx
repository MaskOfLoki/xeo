import { EditPollImage } from './index';
import styles from './module.scss';
import m from 'mithril';
import { Input } from '../../../input';
import { MAX_QUESTION, MAX_ANSWER } from '../../../../utils';
import { FileUpload } from '../../../file-upload';
import { PresetsSelect } from '../../../presets-select';
import { CardType } from '../../../../../../../common/common';
import { ColorPicker } from '../../../color-picker';

export function template(this: EditPollImage) {
  const defaultColors = this.defaultColors();

  return (
    <div class={styles.controlWrapper}>
      <div class={styles.questionAnswer}>
        <div class={styles.questionTextWrapper}>
          <Input
            placeholder='Question...'
            value={this.card.question.label}
            maxlength={MAX_QUESTION}
            oninput={(e) => {
              this.card.question.label = e.target.value;
              this._onchange();
            }}
          />
        </div>
        <div class={styles.questionImageWrapper}>
          <FileUpload
            value={this.card.question.url}
            onchange={(value) => {
              this.card.question.url = value;
              this._onchange();
            }}
          />
        </div>
      </div>
      <div class={styles.divideLine}></div>
      <div class={styles.groupAnswers}>
        {this.card.answers.map((answer, index) => (
          <div class={styles.answer}>
            <div class={styles.answerTextWrapper}>
              <Input
                placeholder={'Answer ' + (index + 1)}
                maxlength={MAX_ANSWER}
                value={answer.label}
                oninput={(e) => {
                  answer.label = e.target.value;
                  this._onchange();
                }}
              />
            </div>
            <div class={styles.answerImageWrapper}>
              <FileUpload
                class={styles.image}
                value={answer.url}
                onchange={(value) => {
                  answer.url = value;
                  this._onchange();
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div class={styles.divideSecondLine}></div>
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
        <div class={styles.column}>
          <div class={styles.rowText}>Question Background</div>
          <div class={styles.color}>
            <ColorPicker
              color={this.card.colors?.backgroundQuestion ?? defaultColors.backgroundQuestion}
              gradient={true}
              candelete={this.card.colors.backgroundQuestion !== defaultColors.backgroundQuestion}
              ondelete={() => {
                this.card.colors.backgroundQuestion = defaultColors.backgroundQuestion;
                this._onchange();
              }}
              onchange={(color) => {
                this.card.colors.backgroundQuestion = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.image}></div>
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
