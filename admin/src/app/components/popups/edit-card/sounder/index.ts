import { template } from './template';
import { BaseEdit, IBaseEditAttrs } from '../base';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import { redraw, Vnode } from 'mithril';
import { ISounderCard } from '../../../../../../../common/common';

export class EditSounder extends BaseEdit {
  private _selectedSound: number;

  public oninit(vnode) {
    super.oninit(vnode);

    if (!this.card.sounds) {
      this.card.sounds = [
        {
          url: 'assets/sounds/scream.mp3',
          name: 'Make Some Noise',
          image: 'assets/images/icons/microphone.svg',
        },
        {
          url: 'assets/sounds/applause.mp3',
          name: 'Applause',
          image: 'assets/images/icons/applause.svg',
        },
        {
          url: 'assets/sounds/airhorn.mp3',
          name: 'Air Horn',
          image: 'assets/images/icons/airhorn.svg',
        },
        {
          url: 'assets/sounds/scream.mp3',
          name: 'Scream',
          image: 'assets/images/icons/scream.svg',
        },
      ];
    }

    this._selectedSound = 0;
  }

  public validate(): boolean {
    if (isEmptyString(this.card.message)) {
      Swal.fire(`Please provide card's sub headline`, '', 'warning');
      return false;
    }

    if (this.card.sounds.some((item) => isEmptyString(item.name))) {
      Swal.fire('Please provide names for all sounds');
      return false;
    }

    if (this.card.sounds.some((item) => isEmptyString(item.url))) {
      Swal.fire('Please provide all sound files');
      return false;
    }

    if (this.card.sounds.some((item) => isEmptyString(item.image))) {
      Swal.fire('Please provide images for all sounds');
      return false;
    }

    if (!this.card.delay || isNaN(this.card.delay) || this.card.delay < 0) {
      this.card.delay = null;
    }

    return true;
  }

  public soundButtonClickHandler(index) {
    this._selectedSound = index;
  }

  public buttonAddHandler() {
    this.card.sounds.push({
      url: undefined,
      name: '',
      image: undefined,
    });

    this._selectedSound = this.card.sounds.length - 1;
    this._onchange();
  }

  public async buttonDeleteHandler(index: number) {
    const result = await Swal.fire({
      title: 'Are you sure you want to delete the sound?',
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    this.card.sounds.splice(index, 1);
    this._selectedSound = 0;

    this._onchange();
    redraw();
  }

  public view({ attrs }: Vnode<IBaseEditAttrs>) {
    return template.call(this, attrs);
  }

  public get card(): ISounderCard {
    return this._card as ISounderCard;
  }

  public get selectedSound(): number {
    return this._selectedSound;
  }

  protected defaultColors() {
    return { header: '#0B224A', icon: '#ffffff' };
  }
}
