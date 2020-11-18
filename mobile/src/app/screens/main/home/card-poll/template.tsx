import { CardPollScreen } from './index';
import m from 'mithril';
import cn from 'classnames';
import { PollType, CardType } from '../../../../../../../common/common';
import { Input } from '../../../../components/input';
import { Button } from '../../../../components/button';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import styles from './module.scss';

export function template(this: CardPollScreen) {
  return (
    this.card.type === CardType.POLL && (
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
          {this.card.pollType === PollType.MULTIPLE_CHOICE && (
            <div class={styles.groupAnswers}>
              {this.card.answers.map((answer, index) => {
                const selected = this.answer === answer;
                const showPercentage = this.percentage[index] != null;
                return (
                  <div
                    class={cn(styles.answer, {
                      [styles.selected]: selected,
                      [styles.disabled]: this.isSubmitted,
                      [styles.percentage]: showPercentage,
                      [styles.selectdisabled]: selected && this.isSubmitted,
                    })}
                    onclick={this.answerSelectHandler.bind(this, answer)}
                    style={{
                      background: this.card.colors?.backgroundAnswer,
                    }}
                  >
                    <span
                      class={styles.answerProgressBar}
                      style={{
                        width: (this.percentage[index] ? this.percentage[index] : '0') + '%',
                      }}
                    ></span>
                    <span class={styles.answerValue}>{answer}</span>
                    {/* {showPercentage && <span class={styles.answerPercentage}>{this.percentage[index]}%</span>} */}
                  </div>
                );
              })}
            </div>
          )}
          {this.card.pollType === PollType.OPEN_RESPONSE && (
            <div class={styles.groupOpenResponse}>
              <Input
                maxlength='20'
                value={this.answer}
                oninput={(e) => this.inputChangeHandler(e.target.value)}
                readonly={this.isSubmitted}
              />
            </div>
          )}
          <Button
            class={cn(styles.buttonSubmit, {
              [styles.clicked]: !isEmptyString(this.answer),
            })}
            disabled={this.isSubmitted || isEmptyString(this.answer)}
            onclick={this.buttonSubmitHandler.bind(this)}
          >
            {this.isSubmitted ? 'THANKS FOR SUBMITTING!' : 'SUBMIT'}
          </Button>
        </div>
      </div>
    )
  );
}
