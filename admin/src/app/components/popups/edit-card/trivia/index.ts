import { template } from './template';
import { BaseEdit, IBaseEditAttrs } from '../base';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { Vnode } from 'mithril';
import { ITriviaAnswer, ITriviaCard } from '../../../../../../../common/common';

export class EditTrivia extends BaseEdit {
  public oninit(vnode: Vnode<IBaseEditAttrs>) {
    super.oninit(vnode);

    if (!this.card.answers) {
      this.card.answers = [];
    }

    if (this.card.answers.length === 0) {
      this.card.answers.push(
        {
          value: '',
          correct: true,
        },
        {
          value: '',
        },
      );
    }
  }

  public correctChangeHandler(answer: ITriviaAnswer) {
    this.card.answers.forEach((answer) => delete answer.correct);
    answer.correct = true;
  }

  public buttonAddAnswerHandler() {
    this.card.answers.push({
      value: '',
    });

    this._onchange && this._onchange();
  }

  public buttonRemoveAnswerHandler(index: number) {
    this.card.answers.splice(index, 1);

    if (!this.card.answers.some((answer) => answer.correct)) {
      this.card.answers[0].correct = true;
    }

    this._onchange && this._onchange();
  }

  public validate(): boolean {
    if (isEmptyString(this.card.question)) {
      Swal.fire(`Please provide card's question`, '', 'warning');
      return false;
    }

    if (this.card.answers.some((answer) => isEmptyString(answer.value))) {
      Swal.fire(`Please fill in all answers`, '', 'warning');
      return false;
    }

    if (
      this.card.answers.some(
        (answer, index) => this.card.answers.findIndex((item) => answer.value === item.value) !== index,
      )
    ) {
      Swal.fire('Please make all answers unique', '', 'warning');
      return false;
    }

    return true;
  }

  public view() {
    return template.call(this);
  }

  public get card(): ITriviaCard {
    return this._card as ITriviaCard;
  }

  protected defaultColors() {
    return { backgroundQuestion: '#00011F', backgroundAnswer: '#00011F' };
  }
}
