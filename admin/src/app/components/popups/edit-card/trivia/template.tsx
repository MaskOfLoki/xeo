import { EditTrivia } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { Input } from '../../../input';
import { MAX_QUESTION, MAX_ANSWER } from '../../../../utils';
import { PresetsSelect } from '../../../presets-select';
import { CardType } from '../../../../../../../common/common';
import { ColorPicker } from '../../../color-picker';
import { FileUpload } from '../../../file-upload';

export function template(this: EditTrivia) {
  const defaultColors = this.defaultColors();

  return (
    <div class={styles.controlWrapper}>
      <div class={styles.questionAnswer}>
        <div class={styles.control}>
          <Input
            placeholder='Question...'
            value={this.card.question}
            maxlength={MAX_QUESTION}
            oninput={(e) => {
              this.card.question = e.target.value;
              this._onchange();
            }}
          ></Input>
        </div>
      </div>
      <div class={styles.divideLine}></div>
      <div class={styles.groupAnswers}>
        {this.card.answers.length < 5 && (
          <button class={`selected ${styles.addAnswer}`} onclick={this.buttonAddAnswerHandler.bind(this)}>
            ADD ANSWER
          </button>
        )}
        {this.card.answers.map((answer, index) => (
          <div class={styles.answer}>
            <div class={styles.answerTextWrapper}>
              <Input
                placeholder={'Answer ' + (index + 1)}
                maxlength={MAX_ANSWER}
                value={answer.value}
                oninput={(e) => {
                  answer.value = e.target.value;
                  this._onchange();
                }}
              />
            </div>
            <div class={styles.buttonDeleteWrapper}>
              {this.card.answers.length > 2 && (
                <button class={styles.buttonDelete} onclick={this.buttonRemoveAnswerHandler.bind(this, index)} />
              )}
            </div>
            <div class={styles.correctAnswerWrapper}>
              <button
                class={cn({
                  selected: answer.correct,
                  outline: !answer.correct,
                })}
                onclick={this.correctChangeHandler.bind(this, answer)}
              >
                Correct Answer
              </button>
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
              color={this.card.colors?.background ?? this.config.home.colors.background}
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
              color={this.card.colors?.text ?? this.config.home.colors.text}
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
        <div class={styles.column}>
          <div class={styles.rowText}>Answer Background</div>
          <div class={styles.color}>
            <ColorPicker
              color={this.card.colors?.backgroundAnswer ?? defaultColors.backgroundAnswer}
              gradient={true}
              candelete={this.card.colors.backgroundAnswer !== defaultColors.backgroundAnswer}
              ondelete={() => {
                this.card.colors.backgroundAnswer = defaultColors.backgroundAnswer;
                this._onchange();
              }}
              onchange={(color) => {
                this.card.colors.backgroundAnswer = color;
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
