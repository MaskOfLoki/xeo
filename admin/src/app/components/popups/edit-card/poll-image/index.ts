import { template } from './template';
import { BaseEdit, IBaseEditAttrs } from '../base';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { Vnode } from 'mithril';
import { IImagePollCard } from '../../../../../../../common/common';

export class EditPollImage extends BaseEdit {
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

    if (!this.card.question) {
      this.card.question = {
        url: undefined,
      };
    }
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

    this.card.answers = this.card.answers.filter((answer) => !isEmptyString(answer.url));

    const answerLabels = this.card.answers.map((answer) => answer.label);

    if (this.card.answers.some((answer, index) => answerLabels.indexOf(answer.label) !== index)) {
      Swal.fire('Please make all answer labels unique', '', 'warning');
      return false;
    }

    return true;
  }

  public view() {
    return template.call(this);
  }

  public get card(): IImagePollCard {
    return this._card as IImagePollCard;
  }

  protected defaultColors() {
    return { backgroundQuestion: '#00011F' };
  }
}
