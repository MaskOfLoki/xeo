import { BaseEdit, IBaseEditAttrs } from '../base';
import { template } from './template';
import { Vnode } from 'mithril';
import Swal from 'sweetalert2';
import { IntegratedGame, IFanFilterCamCard } from '../../../../../../../common/common';
import { api } from '../../../../services/api';

export class EditFanFilterCam extends BaseEdit {
  public oninit(vnode): void {
    super.oninit(vnode);

    if (!this.card.images) {
      this.card.images = {};
    }

    if (!this.card.filters) {
      this.card.filters = {
        emoji: false,
        animal: false,
        custom: {},
      };
    }

    this.card.game = IntegratedGame.FAN_FILTER_CAM;
  }

  public validate(): boolean {
    if (!this.card.filters.animal && !this.card.filters.emoji && Object.keys(this.card.filters.custom).length == 0) {
      Swal.fire('Please select at least 1 filter before saving', '', 'warning');
      return false;
    }

    if (!this.card.images.mainboard) {
      Swal.fire('Please add the image to display on the mainboard', '', 'warning');
      return false;
    }

    return true;
  }

  public view({ attrs }: Vnode<IBaseEditAttrs>) {
    return template.call(this, attrs);
  }

  public get isHam(): boolean {
    return api.cid.endsWith('ham-fighters');
  }

  public get card(): IFanFilterCamCard {
    return this._card as IFanFilterCamCard;
  }
}
