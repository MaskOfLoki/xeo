import { BaseEdit } from '../base';
import { template } from './template';
import { isDeployed } from '../../../../../../../common/utils';
import { api } from '../../../../services/api';
import { IPGPCard } from '../../../../../../../common/common';

export class EditPGP extends BaseEdit {
  public oninit(vnode): void {
    super.oninit(vnode);

    if (!this.card.colors) {
      this.card.colors = {};
    }

    if (!this.card.text) {
      this.card.text = {
        summaryBelowClock: '',
        gameOverTitle: '',
        gameOverSubtitle: '',
      };
    }
  }

  public view() {
    return template.call(this);
  }

  public openPGPAdmin(): void {
    let value: string;

    if (isDeployed()) {
      value = `${window.location.origin}/${this.card.game}`;
    } else {
      value = 'http://localhost:8090'; // Integrated games live on 8091
    }

    value = `${value}?xeo&mode=editor&cid=${api.cid}&event=${this.card.id}`;
    window.open(value, '_blank');
  }

  public get card(): IPGPCard {
    return this._card as IPGPCard;
  }
}
