import { IChannel, CardType, IImageCard } from '../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export function updateImageCards(channel: IChannel): boolean {
  const imageCards = channel.cards.filter((card) => card.type === CardType.IMAGE);
  return imageCards.reduce(processImageCard, false);
}

function processImageCard(previous: boolean, card: IImageCard): boolean {
  let result = false;

  // Pulled from commit 632aa3320092022f9ff0d021afe4aa2ef911786f
  if (isEmptyString(card.imagePortrait) && !isEmptyString(card['imagePortraint'])) {
    card.imagePortrait = card['imagePortraint'];
    delete card['imagePortraint'];
    result = true;
  }

  // If this card does not have images associated with it already
  if (!card.imageLandscape && !card.imagePortrait) {
    const old: string = card['image'];

    // If an old image is present, assign it to the correct fields
    if (old) {
      card.imageLandscape = old;
      card.imagePortrait = old;
      result = true;
    }
  }

  // Clear out any old data that is not needed
  if (card['image']) {
    delete card['image'];
    result = true;
  }

  return result;
}
