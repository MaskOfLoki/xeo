import { IChannel } from '../../../../common/common';

export function addDefaultCardset(channel: IChannel): boolean {
  let updated = false;
  if (!channel.cardSets) {
    channel.cardSets = [];
    updated = true;
  }

  if (!channel.cardSets.length) {
    channel.cardSets.push({
      id: 0,
      name: 'DEFAULT',
    });
    updated = true;
  }

  for (const card of channel.cards) {
    if (card.cardSetId === undefined) {
      card.cardSetId = channel.cardSets[0].id;
      updated = true;
    }
  }

  return updated;
}
