import { Subject } from 'rxjs';
import { isValidFilter, OptionType } from '.';
import {
  CardType,
  ICard,
  IChannel,
  IImagePollCard,
  ISliderCard,
  ITextPollCard,
  ITriviaCard,
  PointsType,
} from '../../../../../../../../../common/common';
import { ICardLeadersFilter, ILeadersFilter } from '../../../../../../utils';
import { ITargetService } from './ITargetService';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { redraw } from 'mithril';

const SUPPORTED_CARDS = [
  CardType.POLL,
  CardType.TRIVIA,
  CardType.REACTION_THUMBS,
  CardType.REACTION_SLIDER,
  CardType.POLL_IMAGE,
  CardType.TRIVIA_IMAGE,
  CardType.REACTION_APPLAUSE,
  CardType.SOUNDER,
];

export class CardTargetService extends Subject<void> implements ITargetService {
  private readonly _cards: ICard[];
  private _conditions: string[] = ['=', '>', '<'];

  constructor(private _channel: IChannel, private readonly _filter?: ICardLeadersFilter) {
    super();
    if (!this._filter) {
      this._filter = {
        type: PointsType.CARD,
        cardType: undefined,
        cardId: undefined,
        response: undefined,
      };
    }

    this._cards = _channel.cards.filter((card) => SUPPORTED_CARDS.includes(card.type));
  }

  public getOptionValues(index: number): Promise<string[]> {
    if (index === 0) {
      return Promise.resolve(this._cards.map((card) => card.name));
    }

    const card: ICard = this._cards.find((card) => card.id === this._filter.cardId);

    switch (card?.type) {
      case CardType.REACTION_APPLAUSE:
      case CardType.SOUNDER: {
        if (index === 1) {
          return Promise.resolve(this._conditions);
        } else if (index === 2) {
          return Promise.resolve([...Array(101)].map((_, index) => (index * 5).toString()));
        }
      }
    }

    return Promise.resolve(this.getResponses(card));
  }

  public getFilter(): ILeadersFilter {
    return this._filter;
  }

  public updateOption(index: number, selected: number): void {
    if (index === 0) {
      this.updateCardOption(selected);
      return;
    }

    const card: ICard = this._cards.find((card) => card.id === this._filter.cardId);

    switch (card?.type) {
      case CardType.REACTION_APPLAUSE:
      case CardType.SOUNDER: {
        if (index === 1) {
          this._filter.condition = this._conditions[selected];
          return this.next();
        } else if (index === 2) {
          this._filter.response = selected;
          return this.next();
        }
        break;
      }
    }

    this.updateResponseOption(selected);
  }

  private updateCardOption(index: number): void {
    delete this._filter.condition;
    this._filter.response = undefined;
    const card = this._cards[index];
    this._filter.cardId = card?.id;
    this._filter.cardType = card?.type;
    redraw();
    this.next();
  }

  private getResponses(card: ICard): string[] {
    switch (card?.type) {
      case CardType.REACTION_THUMBS: {
        return ['THUMB UP', 'THUMB DOWN'];
      }
      case CardType.POLL: {
        const c = card as ITextPollCard;
        return c.answers;
      }
      case CardType.TRIVIA: {
        const c = card as ITriviaCard;
        return c.answers.map((item) => item.value);
      }
      case CardType.REACTION_SLIDER: {
        const c = card as ISliderCard;
        return c.labels;
      }
      case CardType.POLL_IMAGE:
      case CardType.TRIVIA_IMAGE: {
        const c = card as IImagePollCard;
        return c.answers.map((answer, index) => {
          if (isEmptyString(answer.label)) {
            return `Answer ${index + 1}`;
          } else {
            return answer.label;
          }
        });
      }
      default: {
        return [];
      }
    }
  }

  private updateResponseOption(index: number): void {
    if (index === -1) {
      this._filter.response = undefined;
      this.next();
      return;
    }

    const card: ICard = this._cards.find((card) => card.id === this._filter.cardId);

    switch (card?.type) {
      case CardType.REACTION_THUMBS: {
        this._filter.response = index === 0;
        break;
      }
      case CardType.POLL_IMAGE:
      case CardType.TRIVIA_IMAGE: {
        this._filter.response = index.toString();
        break;
      }
      case CardType.REACTION_SLIDER: {
        this._filter.response = index;
        break;
      }
      default:
        this._filter.response = this.getResponses(card)[index];
        break;
    }

    this.next();
  }

  public getOptionLabel(index: number): string {
    const card = this._cards.find((card) => card.id === this._filter.cardId);

    switch (card?.type) {
      case CardType.REACTION_APPLAUSE:
      case CardType.SOUNDER: {
        if (index === 1) {
          return 'CONDITION';
        } else if (index === 2) {
          return 'TAPS';
        }
      }
    }

    return index === 0 ? 'CARD NAME' : 'RESPONSE';
  }

  public getSelectedOption(index: number): string {
    if (index === 0) {
      return this._cards.find((card) => this._filter.cardId === card.id)?.name;
    }

    const card: ICard = this._cards.find((card) => card.id === this._filter.cardId);

    switch (card?.type) {
      case CardType.REACTION_THUMBS: {
        if (this._filter.response == null) {
          return;
        } else {
          return this._filter.response ? 'THUMB UP' : 'THUMB DOWN';
        }
      }
      case CardType.POLL_IMAGE: {
        return this.getResponses(card)[parseInt(this._filter.response)];
      }
      case CardType.REACTION_APPLAUSE:
      case CardType.SOUNDER: {
        if (index === 1) {
          return this._filter.condition;
        } else if (index === 2) {
          return this._filter.response?.toString();
        }
        break;
      }
      case CardType.REACTION_SLIDER: {
        return this.getResponses(card)[this._filter.response];
      }
    }

    return this._filter.response;
  }

  public isValidFilter(): boolean {
    return isValidFilter(this._filter);
  }

  public getOptionType(index: number): OptionType {
    return this.totalOptions === 3 && index === 2 ? OptionType.NUMBER : OptionType.SELECT;
  }

  public get totalOptions(): number {
    const card = this._cards.find((card) => card.id === this._filter.cardId);

    switch (card?.type) {
      case CardType.REACTION_APPLAUSE:
      case CardType.SOUNDER: {
        return 3;
      }
    }

    return 2;
  }

  public destroy(): void {
    // TODO
  }
}
