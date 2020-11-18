import { template } from './template';
import { BaseEdit, IBaseEditAttrs } from '../base';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { Vnode } from 'mithril';
import { IImageTriviaAnswer, IImageTriviaCard } from '../../../../../../../common/common';

export class EditTriviaImage extends BaseEdit {
  public oninit(vnode: Vnode<IBaseEditAttrs>) {
    super.oninit(vnode);

    if (!this.card.answers) {
      this.card.answers = [];
    }

    while (this.card.answers.length < 4) {
      this.card.answers.push({
        url: undefined,
      });
    }

    if (!this.card.answers.some((item) => item.correct)) {
      this.card.answers[0].correct = true;
    }

    if (!this.card.question) {
      this.card.question = {
        url: undefined,
      };
    }
  }

  public answerImageChangeHandler(answer: IImageTriviaAnswer, url: string) {
    answer.url = url;

    if (isEmptyString(url) && answer.correct) {
      answer = this.card.answers.find((item) => !isEmptyString(item.url));

      if (answer) {
        answer.correct = true;
      }
    }

    this._onchange && this._onchange();
  }

  public correctChangeHandler(answer: IImageTriviaAnswer) {
    this.card.answers.forEach((answer) => delete answer.correct);
    answer.correct = true;
  }

  public validate(): boolean {
    if (isEmptyString(this.card.question.url) && isEmptyString(this.card.question.label)) {
      Swal.fire('Please provide question image or text', '', 'warning');
      return;
    }

    if (this.card.answers.filter((answer) => !isEmptyString(answer.url)).length < 2) {
      Swal.fire('Please upload at least 2 answer images', '', 'warning');
      return;
    }

    if (isEmptyString(this.card.answers.find((item) => item.correct).url)) {
      Swal.fire('Please select correct answer with an image', '', 'warning');
      return;
    }

    this.card.answers = this.card.answers.filter((answer) => !isEmptyString(answer.url));

    const answerLabels = this.card.answers.map((answer) => answer.label);

    if (this.card.answers.some((answer, index) => answerLabels.indexOf(answer.label) !== index)) {
      Swal.fire('Please make all answer labels unique', '', 'warning');
      return false;
    }

    return true;
  }

  public view({ attrs }: Vnode<IBaseEditAttrs>) {
    return template.call(this, attrs);
  }

  public get card(): IImageTriviaCard {
    return this._card as IImageTriviaCard;
  }

  protected defaultColors() {
    return { backgroundQuestion: '#00011F' };
  }
}
