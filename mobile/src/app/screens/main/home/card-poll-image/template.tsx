import { CardPollImageScreen } from './index';
import m from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import cn from 'classnames';
import { CardType } from '../../../../../../../common/common';
import { Button } from '../../../../components/button';
import styles from './module.scss';

export function template(this: CardPollImageScreen) {
  return (
    this.card.type === CardType.POLL_IMAGE && (
      <div
        class={cn(styles.screen, {
          [styles.hasChannelVideo]: this.hasChannelVideo && this.showMediaContent,
          [styles.showChatroom]: this.showChatroom,
        })}
      >
        <div class={styles.cardInfo}>
          {!isEmptyString(this.card.question.url) && (
            <div
              class={styles.questionImage}
              style={{
                backgroundImage: `url(${this.card.question.url})`,
              }}
            />
          )}
          {!isEmptyString(this.card.question.label) && (
            <div
              class={styles.question}
              style={{
                background: this.card.colors?.backgroundQuestion,
              }}
            >
              <span class={styles.questionText}>{this.card.question.label}</span>
            </div>
          )}
        </div>
        <div class={styles.cardControls}>
          <div class={styles.groupAnswers}>
            {this.card.answers.map((answer, index) => {
              const selected = this.answer === index;
              const showPercentage = this.percentage[index] != null;
              return (
                <div
                  class={cn(styles.answer, {
                    [styles.selected]: selected,
                    [styles.disabled]: this.isSubmitted,
                    [styles.percentage]: showPercentage,
                  })}
                  onclick={this.answerSelectHandler.bind(this, index)}
                >
                  <div
                    class={styles.answerImage}
                    style={{
                      backgroundImage: `url(${answer.url})`,
                    }}
                  >
                    <span
                      class={styles.answerProgressBar}
                      style={{
                        width: (this.percentage[index] ? this.percentage[index] : '0') + '%',
                      }}
                    ></span>
                  </div>
                  <div class={styles.answerLabel}>
                    {answer.label}
                    {answer.label && showPercentage && ' - '}
                    {showPercentage && this.percentage[index] + '%'}
                  </div>
                </div>
              );
            })}
          </div>
          <Button
            class={styles.buttonSubmit}
            disabled={this.isSubmitted || this.answer == null}
            onclick={this.buttonSubmitHandler.bind(this)}
          >
            {this.isSubmitted ? 'THANKS!' : 'SUBMIT'}
          </Button>
        </div>
      </div>
    )
  );
}
