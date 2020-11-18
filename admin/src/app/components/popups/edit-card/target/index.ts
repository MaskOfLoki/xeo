import { template } from './template';
import { BaseEdit, IBaseEditAttrs } from '../base';
import { redraw, Vnode } from 'mithril';
import { CardTypePopup } from '../../card-type';
import { EditCardPopup } from '..';
import Swal from 'sweetalert2';
import { cloneObject } from '@gamechangerinteractive/xc-backend/utils';
import {
  CardStopMode,
  CardType,
  ICard,
  IConfig,
  IMultipleChoiceSignupField,
  ITargetCard,
  ITeamConfig,
  ITextPollCard,
  PollType,
  SignupFieldType,
  TargetType,
} from '../../../../../../../common/common';
import { PopupManager } from '../../../../../../../common/popups/PopupManager';
import { generateUniqueCardId } from '../../../../utils';
import { api } from '../../../../services/api';

const SUPPORTED_CARD_TYPES: CardType[] = [
  CardType.REACTION_THUMBS,
  CardType.POLL,
  CardType.POLL_IMAGE,
  CardType.TRIVIA,
  CardType.TRIVIA_IMAGE,
  CardType.REACTION_SLIDER,
];

export class EditTarget extends BaseEdit {
  public targetTypes: TargetType[] = [TargetType.SIGNUP, TargetType.CARD, TargetType.TEAM];
  public signupFields: IMultipleChoiceSignupField[] = [];
  public channelCards: ICard[] = [];
  public teams: ITeamConfig[] = [];

  public async oninit(vnode: Vnode<IBaseEditAttrs>) {
    super.oninit(vnode);

    if (!this.card.targetType) {
      this.card.targetType = TargetType.SIGNUP;
    }

    if (!this.card.entries) {
      this.card.entries = [];
    }

    this.channelCards = this._channel.cards.filter((item) => {
      if (!SUPPORTED_CARD_TYPES.includes(item.type)) {
        return false;
      }

      if (item.type === CardType.POLL && (item as ITextPollCard).pollType === PollType.OPEN_RESPONSE) {
        return false;
      }

      return true;
    });

    this.teams = (await api.loadChannelTeamsConfig(this._channel.id)).teams;

    this.updateTargets();
  }

  private updateTargets() {
    if (!this.card) {
      return;
    }

    switch (this.card.targetType) {
      case TargetType.SIGNUP: {
        if (!this.card.target) {
          this.card.target = this.signupFields[0];
        }

        redraw();
        return;
      }
      case TargetType.CARD: {
        if (!this.card.target) {
          this.card.target = this.channelCards[0];
        }

        redraw();
        return;
      }

      case TargetType.TEAM: {
        if (!this.card.target && this.teams.length > 0) {
          this.card.target = this.teams[0];
          redraw();
          return;
        }
      }
    }
  }

  protected configHandler(value: IConfig) {
    super.configHandler(value);
    this.signupFields = this._config.signup.fields.filter(
      (item) => item.type === SignupFieldType.MULTIPLE_CHOICE,
    ) as IMultipleChoiceSignupField[];
    this.updateTargets();
  }

  public async targetTypeChangeHandler(e: Event) {
    const select: HTMLSelectElement = e.target as HTMLSelectElement;

    if (this.card.entries.length > 0) {
      const result = await Swal.fire({
        title: 'Are you sure you want to change target type?',
        text: 'All current entries will be cleared',
        showCancelButton: true,
      });

      if (result.dismiss) {
        select.selectedIndex = this.targetTypes.indexOf(this.card.targetType);
        redraw();
        return;
      }
    }

    this.card.target = undefined;
    this.card.targetType = this.targetTypes[select.selectedIndex];
    this.card.entries = [];
    this.updateTargets();
  }

  public targetChangeHandler(value: IMultipleChoiceSignupField | ICard) {
    this.card.target = value;
  }

  public async buttonAddCardHandler(relation: string) {
    const type = await PopupManager.show(CardTypePopup, {
      skip: [
        CardType.TARGET,
        CardType.HAT_SHUFFLE,
        CardType.SKEEBALL,
        CardType.QB_TOSS,
        CardType.POP_A_SHOT,
        CardType.TURBO_TRIVIA_2,
      ],
    });

    if (type == null) {
      return;
    }

    const card: ICard = await PopupManager.show(EditCardPopup, {
      card: {
        id: generateUniqueCardId(this._channel),
        name: '',
        type,
      },
      channel: this._channel,
      disabledStopSettings: true,
    });

    if (!card) {
      return;
    }

    this.card.entries.push({
      relation,
      card,
    });
  }

  public async cardEditHandler(card: ICard) {
    const index = this.card.entries.findIndex((item) => item?.card?.id === card.id);
    card = await PopupManager.show(EditCardPopup, {
      card: cloneObject(card),
      channel: this._channel,
      disabledStopSettings: true,
    });

    if (!card) {
      return;
    }

    this.card.entries[index].card = card;
  }

  public cardDeleteHandler(index: number) {
    this.card.entries.splice(index, 1);
  }

  public validate(): boolean {
    if (!super.validate()) {
      return;
    }

    if (this.card.entries.length === 0) {
      Swal.fire({
        title: 'Please add at least one card',
        icon: 'warning',
      });
      return;
    }

    for (const entry of this.card.entries) {
      const card: ICard = entry.card;
      card.stopMode = this.card.stopMode;

      switch (card.stopMode) {
        case CardStopMode.AUTO: {
          card.stopTimer = this.card.stopTimer;
          break;
        }
        case CardStopMode.CENSUS: {
          card.stopCensus = this.card.stopCensus;
          break;
        }
      }
    }

    return true;
  }

  public view() {
    return template.call(this);
  }

  public get card(): ITargetCard {
    return this._card as ITargetCard;
  }
}
