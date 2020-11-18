import { template } from './template';
import { BaseEdit, IBaseEditAttrs } from '../base';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { Vnode } from 'mithril';
import { PollType, ITextPollCard } from '../../../../../../../common/common';

export class EditPoll extends BaseEdit {
  public oninit(vnode: Vnode<IBaseEditAttrs>) {
    super.oninit(vnode);

    if (!this.card.answers) {
      this.card.answers = [];
    }

    if (!this.card.pollType) {
      this.card.pollType = PollType.MULTIPLE_CHOICE;
    }

    if (this.card.answers.length === 0) {
      this.card.answers.push('', '');
    }
  }

  public buttonAddAnswerHandler() {
    this.card.answers.push('');
    this._onchange && this._onchange();
  }

  public buttonRemoveAnswerHandler(index: number) {
    this.card.answers.splice(index, 1);
    this._onchange && this._onchange();
  }

  public validate(): boolean {
    if (isEmptyString(this.card.question)) {
      Swal.fire(`Please provide card's question`, '', 'warning');
      return false;
    }

    if (this.card.pollType === PollType.MULTIPLE_CHOICE) {
      if (this.card.answers.some(isEmptyString)) {
        Swal.fire(`Please fill in all answers`, '', 'warning');
        return false;
      }

      if (this.card.answers.some((answer, index) => this.card.answers.indexOf(answer) !== index)) {
        Swal.fire('Please make all answers unique', '', 'warning');
        return false;
      }
    } else {
      this.card.answers = [];
    }

    return true;
  }

  public view() {
    return template.call(this);
  }

  public get card(): ITextPollCard {
    return this._card as ITextPollCard;
  }

  protected defaultColors() {
    return { backgroundQuestion: '#00011F', backgroundAnswer: '#00011F' };
  }
}
