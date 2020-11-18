import { IState, IChannel, PointsType, CardType } from '../../../../common/common';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { randInt } from '@gamechangerinteractive/xc-backend/utils';

export interface IPrizesHoldersInfo {
  state: IState;
  users: number;
}

export const MAX_CHANNELS = 5;
export const MAX_CHANNEL_DELETE_DAYS = 30;
export const DEFAULT_PRESET_FIELDS: string[] = ['id', 'type', 'name'];

export function validURL(str: string): boolean {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
}

export function toPromise<T>(observable: Observable<T>): Promise<T> {
  return new Promise((resolve) => observable.pipe(first()).subscribe(resolve));
}

export const MAX_CARD_NAME = 20;
export const MAX_HEADER = 20;
export const MAX_MESSAGE = 30;
export const MAX_ANSWER = 25;
export const MAX_QUESTION = 100;
export const MAX_CARDSET_NAME = 30;
export const MAX_COUPON_NAME = 30;
export const MAX_COUPON_REDEMPTION_DAYS = 999;
export const DEFAULT_CARD_SET_ID = 0;
export const MAX_TEAM_NAME = 30;

export function generateUniqueCardId(channel: IChannel): number {
  let id: number;

  do {
    id = randInt(1000000000);
  } while (channel.cards.some((card) => card.id === id));
  return id;
}

export function generateUniqueCardName(channel: IChannel, cardName: string): string {
  let name: string;
  let index = 1;

  do {
    name = `${cardName} Copy ${index++}`;
  } while (channel.cards.some((card) => card.name === name));
  return name;
}

export function generateUniqueCardSetId(channel: IChannel): number {
  let id: number;

  do {
    id = randInt(1000000000);
  } while (channel.cardSets.some((set) => set.id === id));
  return id;
}

export interface ILeadersRequest {
  channel: string;
  lid?: string;
  dateRange?: Date[];
  filters: ILeadersFilter[];
}

export interface IPaginatedLeadersRequest extends ILeadersRequest {
  skip: number;
  limit: number;
  bannedOnly: boolean;
}

export interface IPaginatedLeadersResponse {
  total: number;
  items;
}

export interface IResetLeadersRequest {
  channel: string;
  lid?: string;
  dateRange?: Date[];
}

export interface ILeadersFilter {
  type: PointsType;
}

export interface ICardLeadersFilter extends ILeadersFilter {
  cardId: number;
  cardType: CardType;
  condition?: string;
  response: any;
}

export interface ISignUpLeadersFilter extends ILeadersFilter {
  field: string;
  value: string;
}

export interface IGameLeadersFilter extends ILeadersFilter {
  gid: string;
  condition: string;
  score: number;
}

export interface ITeamLeadersFilter extends ILeadersFilter {
  team: string;
}

export function generateUniqueCardSetName(channel: IChannel, cardSetName: string): string {
  let name: string;
  let index = 1;

  do {
    name = `${cardSetName} Copy ${index++}`;
  } while (channel.cardSets.some((cardSet) => cardSet.name === name));
  return name;
}
