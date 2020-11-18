import { template } from './template';
import { BaseEdit } from '../base';
import { ISliderCard } from '../../../../../../../common/common';

export class EditSlider extends BaseEdit {
  public view() {
    return template.call(this);
  }

  public get card(): ISliderCard {
    return this._card as ISliderCard;
  }
}
