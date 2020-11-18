import { redraw, Vnode, VnodeDOM } from 'mithril';
import { template } from './template';
import { CardTypePopup } from '../popups/card-type';
import { EditCardPopup } from '../popups/edit-card';
import { cloneObject, isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import Swal from 'sweetalert2';
import {
  generateUniqueCardId,
  generateUniqueCardSetId,
  DEFAULT_CARD_SET_ID,
  generateUniqueCardName,
} from '../../utils';
import basicContext from 'basiccontext';
import { Sortable } from '@shopify/draggable';
import styles from './module.scss';
import deepEqual from 'fast-deep-equal';
import { ChannelStateComponent, IChannelStateAttrs } from '../../utils/ChannelStateComponent';
import { ICard, IChannel, CardType, CardStatus, IState, ICardSet, IConfig } from '../../../../../common/common';
import { PopupManager } from '../../../../../common/popups/PopupManager';
import { EditCardSetPopup } from '../popups/edit-card-set';
import { api } from '../../services/api';
import { combineLatest, Unsubscribable } from 'rxjs';

export interface ICardsPanelAttrs extends IChannelStateAttrs {
  ondragend: (e: DragEvent, card: ICard) => void;
  onsave: (value: IChannel) => void;
  ondelete: (card: ICard) => void;
  disabled: boolean;
}

export enum SearchType {
  DEFAULT,
  REACTION_THUMBS,
  REACTION_APPLAUSE,
  REACTION_SLIDER,
  SOUNDER,
  TRIVIA,
  POLL,
  IMAGE,
  VIDEO,
  SKEEBALL,
  HAT_SHUFFLE,
  FAN_FILTER_CAM,
  TARGET,
  DONE,
  UNUSED,
  TITLE_SEARCH,
}

export class CardsPanel extends ChannelStateComponent<ICardsPanelAttrs> {
  public visibleCards: ICard[] = [];
  public activeCardSet: ICardSet;

  private _searchType: SearchType = SearchType.DEFAULT;
  private _searchFilter: string;
  private _onsave: (value: IChannel) => void;
  private _ondelete: (chard: ICard) => void;
  private _ondragend: (e: DragEvent, card: ICard) => void;
  private _sortable: Sortable;
  private _groupCards: HTMLElement;
  private _allCards: ICard[] = [];
  private _allCardSets: ICardSet[] = [];
  private _subscription: Unsubscribable;
  private _isArcadeTriviaEnabled: boolean;

  private _items = [
    {
      title: 'Default',
      fn: this.searchHandler.bind(this, SearchType.DEFAULT),
    },
    {
      title: 'Thumbs',
      fn: this.searchHandler.bind(this, SearchType.REACTION_THUMBS),
    },
    {
      title: 'Applause',
      fn: this.searchHandler.bind(this, SearchType.REACTION_APPLAUSE),
    },
    {
      title: 'Slider',
      fn: this.searchHandler.bind(this, SearchType.REACTION_SLIDER),
    },
    {
      title: 'Sounder',
      fn: this.searchHandler.bind(this, SearchType.SOUNDER),
    },
    {
      title: 'Trivia',
      fn: this.searchHandler.bind(this, SearchType.TRIVIA),
    },
    {
      title: 'Poll',
      fn: this.searchHandler.bind(this, SearchType.POLL),
    },
    {
      title: 'Image',
      fn: this.searchHandler.bind(this, SearchType.IMAGE),
    },
    {
      title: 'Video',
      fn: this.searchHandler.bind(this, SearchType.VIDEO),
    },
    {
      title: 'Skeeball',
      fn: this.searchHandler.bind(this, SearchType.SKEEBALL),
    },
    {
      title: 'Shuffle',
      fn: this.searchHandler.bind(this, SearchType.HAT_SHUFFLE),
    },
    {
      title: 'FFC',
      fn: this.searchHandler.bind(this, SearchType.FAN_FILTER_CAM),
    },
    {
      title: 'Target Card',
      fn: this.searchHandler.bind(this, SearchType.TARGET),
    },
    {
      title: 'Done',
      fn: this.searchHandler.bind(this, SearchType.DONE),
    },
    {
      title: 'Unused',
      fn: this.searchHandler.bind(this, SearchType.UNUSED),
    },
    {
      title: 'Title Search',
      fn: this.searchHandler.bind(this, SearchType.TITLE_SEARCH, true),
    },
  ];

  public oncreate({ dom }: VnodeDOM) {
    this._groupCards = dom.querySelector(`.${styles.groupCards}`);
    this.activeCardSetHandler();
    this.searchHandler();

    this._sortable = new Sortable(this._groupCards, {
      draggable: `.${styles.cardWrapper}`,
    });

    this._sortable.on('sortable:stop', this.sortStopHandler.bind(this));

    // Turbo Trivia 2
    this._subscription = combineLatest([
      api.configField<any>(`arcade.enable-turbo-trivia-2`, 'common'),
      api.configField<any>(`arcade.enable-turbo-trivia-2`, this.channel.id),
    ]).subscribe((values) => {
      this._isArcadeTriviaEnabled = values[1];
      if (this._isArcadeTriviaEnabled === undefined) {
        this._isArcadeTriviaEnabled = values[0];
      }
    });
  }

  public onbeforeupdate(vnode: Vnode<ICardsPanelAttrs>) {
    super.onbeforeupdate(vnode);
    this.invalidateCardSets();
    this.invalidateVisibleCards();
  }

  protected stateHandler(value: IState) {
    super.stateHandler(value);
    this.invalidateCardSets();
    this.invalidateVisibleCards();
  }

  private invalidateVisibleCards() {
    if (deepEqual(this._allCards, this.channel.cards)) {
      return;
    }

    this._allCards = this.channel.cards.concat();
    this._allCards.forEach((card) => {
      if (!card.cardSetId) {
        card.cardSetId = DEFAULT_CARD_SET_ID;
      }
    });

    this.searchHandler(this._searchType);
  }

  private invalidateCardSets() {
    if (!this.channel.cardSets) {
      this.channel.cardSets = [];
    }

    if (!deepEqual(this._allCardSets, this.channel.cardSets)) {
      this._allCardSets = this.channel.cardSets.concat();
      this.activeCardSetHandler();
    }
  }

  private sortStopHandler(e) {
    if (this._ondragend) {
      let isDisableDrag = false;
      const draggedCard = this.visibleCards[e.oldIndex];

      // If the card is already in timeline, then disable it.
      if (this.channel.timeline && !this.channel.online) {
        isDisableDrag = !!this.channel.timeline.cards.find((card) => card.id === draggedCard.id);
      }

      if (!isDisableDrag) {
        this._ondragend(e, draggedCard);
      }
    }

    setTimeout(() => {
      const cardElements: HTMLElement[] = Array.from(
        this._groupCards.querySelectorAll(`.${styles.cardWrapper}`),
      ).filter(
        (item) => !item.classList.contains('draggable-mirror') && !item.classList.contains('draggable--original'),
      ) as HTMLElement[];

      const previousOrderedCards = this.visibleCards.concat();
      const cards = cloneObject(previousOrderedCards);

      // rearrange actual cards array according to dom elements positions
      cardElements.forEach(
        (element, index) => (cards[index] = this.visibleCards.find((card) => card.id === parseInt(element.id))),
      );

      this.visibleCards = cards;

      // means cards were filtered, we don't need to save sort for that case
      if (
        this.visibleCards.length !==
        this.channel.cards.filter((item) => item.cardSetId === this.activeCardSet.id).length
      ) {
        return;
      }

      if (deepEqual(previousOrderedCards, cards)) {
        return;
      }

      const formerCards = this.channel.cards.concat();
      const allCards = formerCards.filter((card) => cards.findIndex((c) => card.id === c.id) === -1);
      allCards.push(...cards);

      this.channel.cards = allCards;
      this._onsave(this.channel);
    }, 100);
  }

  private activeCardSetHandler(): void {
    const newActiveSet = this._allCardSets.find((set) => set.id === this.activeCardSet?.id);
    if (newActiveSet) {
      this.activeCardSet = newActiveSet;
    } else {
      this.activeCardSet = this._allCardSets[0];
    }
  }

  private async searchHandler(type: SearchType = SearchType.DEFAULT, clear = false) {
    if (clear) {
      this._searchFilter = '';
    }

    this._searchType = type;

    switch (type) {
      case SearchType.DEFAULT: {
        this.visibleCards = cloneObject(this._allCards);
        break;
      }
      case SearchType.DONE: {
        this.visibleCards = this._allCards.filter((card) => card.status === CardStatus.DONE);
        break;
      }
      case SearchType.UNUSED: {
        this.visibleCards = this._allCards.filter((card) => card.status === CardStatus.INACTIVE);
        break;
      }
      case SearchType.TITLE_SEARCH: {
        if (isEmptyString(this._searchFilter)) {
          const { value } = await Swal.fire({
            title: 'Search Keyword',
            input: 'text',
            inputAutoTrim: true,
            inputPlaceholder: 'Keyword',
            focusConfirm: false,
            allowOutsideClick: true,
            allowEscapeKey: true,
          });

          this._searchFilter = value;
        }

        if (!isEmptyString(this._searchFilter)) {
          this.visibleCards = this._allCards.filter((card) =>
            card.name.toLowerCase().includes(this._searchFilter.toLowerCase()),
          );
        } else {
          this.visibleCards = cloneObject(this._allCards);
        }

        break;
      }
      default: {
        const cardType = SearchType[type];
        this.visibleCards = this._allCards.filter(
          (card) => card.type === CardType[cardType] || card.type === CardType[`${cardType}_IMAGE`],
        );
        break;
      }
    }

    this.cardSetHandler();

    redraw();
  }

  private cardSetHandler(): void {
    this.visibleCards = this.visibleCards.filter((card) => card.cardSetId === this.activeCardSet.id);
  }

  public buttonActiveCardSetChangeHandler(active: ICardSet): void {
    this.invalidateCardSets();
    this.activeCardSet = this._allCardSets.find((set) => set.id === active?.id) || this._allCardSets[0];
    this.searchHandler();
  }

  public buttonCardSearchHandler(e: Event) {
    basicContext.show(this._items, e);
  }

  public async buttonCardSetAddHandler() {
    const set: ICardSet = await PopupManager.show(EditCardSetPopup, {
      cardSet: {
        id: this._allCardSets.length ? generateUniqueCardSetId(this.channel) : DEFAULT_CARD_SET_ID,
        name: `SET ${(this._allCardSets.length + 1).toString().padStart(2, '0')}`,
      },
      channel: this.channel,
    });

    if (!set) {
      return;
    }

    this.channel.cardSets.push(set);
    this.activeCardSet = null;
    this.activeCardSet = set;
    this._onsave(this.channel);
    this.cardSetHandler();
  }

  public async buttonCardSetEditHandler(set: ICardSet) {
    const index = this.channel.cardSets.findIndex((s) => s.id === set.id);

    set = await PopupManager.show(EditCardSetPopup, {
      cardSet: cloneObject(set),
      channel: this.channel,
    });

    if (!set) {
      return;
    }

    api.markAdminAction('CARDSET EDIT', { old: this.channel.cardSets[index], new: set });

    this.channel.cardSets[index] = set;
    this._onsave(this.channel);
    this.activeCardSet = set;
    this.cardSetHandler();
  }

  public async buttonCardSetDeleteHandler(set: ICardSet) {
    const result = await Swal.fire({
      title: `Are you sure you want to delete card set "${set.name}"? All cards in this set will be permanently deleted.`,
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    api.markAdminAction('CARDSET DELETE', set);

    const cardsToDelete = this.channel.cards.filter((card) => card.cardSetId === set.id);
    cardsToDelete.forEach((card) => this.deleteCard(card));

    const index = this.channel.cardSets.indexOf(this.channel.cardSets.find((s) => s.id === set.id));
    this.channel.cardSets.splice(index, 1);

    this._onsave(this.channel);
    this.buttonActiveCardSetChangeHandler(this.activeCardSet);
    redraw();
  }

  public async buttonAddNewCardHandler() {
    const type = await PopupManager.show(CardTypePopup, {
      skip: !this._isArcadeTriviaEnabled ? [] : [CardType.TURBO_TRIVIA_2],
    });

    if (type == null) {
      return;
    }

    if (type === CardType.TARGET && this.channel.cards.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Please add at least one card before creating target card.',
      });
      return;
    }

    const card: ICard = await PopupManager.show(EditCardPopup, {
      card: {
        id: generateUniqueCardId(this.channel),
        name: '',
        type,
      },
      channel: this.channel,
    });

    if (!card) {
      return;
    }

    card.cardSetId = this.activeCardSet.id;

    this.channel.cards.push(card);
    this._onsave(this.channel);
    this.searchHandler();
  }

  public async cardEditHandler(card: ICard) {
    const editedCard: ICard = await PopupManager.show(EditCardPopup, {
      card: cloneObject(card),
      channel: this.channel,
    });

    if (!editedCard) {
      return;
    }

    api.markAdminAction('CARD EDIT');

    let index = this.channel.cards.findIndex((item) => item.id === card.id);

    if (index === -1 || !deepEqual(this.channel.cards[index], card)) {
      const result = await Swal.fire({
        icon: 'warning',
        text: 'Looks like the card was updated by another admin. Are you sure you want to save it?',
        showCancelButton: true,
      });

      if (result.dismiss) {
        return;
      }
    }

    index = this.channel.cards.findIndex((item) => item.id === card.id);

    if (index === -1) {
      this.channel.cards.push(editedCard);
    } else {
      this.channel.cards[index] = editedCard;
    }

    this._onsave(this.channel);
    this.searchHandler();
  }

  public async cardDeleteHandler(card: ICard) {
    const result = await Swal.fire({
      title: `Are you sure you want to delete card "${card.name}"?`,
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    api.markAdminAction('CARD DELETE', card.name);

    this.deleteCard(card);

    this._onsave(this.channel);
    this.searchHandler(this._searchType ?? SearchType.DEFAULT);
    redraw();
  }

  private deleteCard(card: ICard): void {
    this.channel.cards.splice(
      this.channel.cards.findIndex((item) => item.id === card.id),
      1,
    );
    let timelineIndex: number = this.channel.timeline.cards.findIndex((item) => item.id === card.id);

    while (timelineIndex !== -1) {
      this.channel.timeline.cards.splice(timelineIndex, 1);
      timelineIndex = this.channel.timeline.cards.findIndex((item) => item.id === card.id);
    }

    if (this._ondelete) {
      this._ondelete(card);
    }
  }

  public cardDuplicateHandler(card: ICard) {
    api.markAdminAction('CARD DUPLICATE');
    card = cloneObject(card);
    card.id = generateUniqueCardId(this.channel);
    card.name = generateUniqueCardName(this.channel, card.name);
    this.channel.cards.push(card);
    this._onsave(this.channel);
    this.searchHandler();
  }

  public async switchCardSetsHandler(card: ICard) {
    const index = this.channel.cards.findIndex((c) => c.id === card.id);
    const setOptions: any = {};
    this._allCardSets.map((set) => (setOptions[set.id] = set.name));

    const result = await Swal.fire({
      title: 'Switch Card Sets',
      input: 'select',
      inputOptions: setOptions,
      inputPlaceholder: 'Select Card Set',
      showCancelButton: true,
      inputValidator: (value) => !value && 'Please select a card set',
    });

    if (result.dismiss) {
      return;
    }

    api.markAdminAction('CARD MOVE SET', {
      from: this.channel.cards[index].cardSetId,
      to: parseInt(result.value),
      toRaw: result.value,
    });

    this.channel.cards[index].cardSetId = parseInt(result.value);
    this._onsave(this.channel);
    this.searchHandler();
  }

  public onremove() {
    if (this._sortable) {
      this._sortable.destroy();
    }

    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  public setChannelPreview(isPreview: boolean) {
    if (this.channel.isPreview !== isPreview) {
      api.markAdminAction('TOGGLE CHANNEL PREVIEW', { from: this.channel.isPreview, to: isPreview });
      this.channel.isPreview = isPreview;
      this._onsave(this.channel);
      redraw();
    }
  }

  public get isPreview(): boolean {
    return this.channel.isPreview;
  }

  public view({ attrs }: Vnode<ICardsPanelAttrs>) {
    this._onsave = attrs.onsave;
    this._ondelete = attrs.ondelete;
    this._ondragend = attrs.ondragend;
    return template.call(this, attrs);
  }
}
