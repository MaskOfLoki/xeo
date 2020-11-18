import { CardTriviaScreen } from './index';
import m from 'mithril';
import cn from 'classnames';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { Button } from '../../../../components/button';
import styles from './module.scss';

export function template(this: CardTriviaScreen) {
  const isUserCorrect = this.card.answers.find((answer, index) => answer.value === this.answer && answer.correct)
    ? true
    : false;
  return (
    <div
      class={cn(styles.screen, {
        [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
        [styles.showChatroom]: this.showChatroom,
      })}
    >
      <div class={styles.cardInfo}>
        <div
          class={styles.question}
          style={{
            background: this.card.colors?.backgroundQuestion,
          }}
        >
          <span class={styles.questionText}>{this.card.question}</span>
        </div>
      </div>
      <div class={styles.cardControls}>
        <div class={styles.groupAnswers}>
          {this.card.answers.map((answer, index) => {
            const selected = this.answer === answer.value;
            const showPercentage = this.percentage[index] != null;
            const isCorrect = showPercentage && answer.correct;
            const isIncorrect = showPercentage && selected && !answer.correct;

            return (
              <div
                class={cn(styles.answer, {
                  [styles.disabled]: this.isSubmitted,
                  [styles.selected]: selected,
                  [styles.correct]: isCorrect,
                  [styles.incorrect]: isIncorrect,
                  [styles.percentage]: showPercentage,
                })}
                style={{
                  background: this.card.colors?.backgroundAnswer,
                }}
                onclick={this.answerSelectHandler.bind(this, answer)}
              >
                {isCorrect && <div class={cn(styles.right)} />}
                {isIncorrect && <div class={cn(styles.wrong)} />}
                <span
                  class={styles.answerProgressBar}
                  style={{
                    width: (this.percentage[index] ?? '0') + '%',
                  }}
                ></span>
                <span class={styles.answerValue}>{answer.value}</span>
                {showPercentage && <span class={styles.answerPercentage}>{this.percentage[index]}%</span>}
              </div>
            );
          })}
        </div>
        <Button
          class={styles.buttonSubmit}
          disabled={this.isSubmitted || isEmptyString(this.answer)}
          onclick={this.buttonSubmitHandler.bind(this)}
        >
          {this.isSubmitted ? (isUserCorrect ? 'CORRECT' : 'INCORRECT') : 'SUBMIT'}
        </Button>
      </div>
    </div>
  );
}
