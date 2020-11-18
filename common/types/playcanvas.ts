export enum OutgoingEvents {
  STATE = 'state',
  CONFIG = 'config',
  USER = 'user',
  GAME_DATA = 'game_data',
  RESPONSE = 'response',
}

export enum IncomingEvents {
  READY = 'ready',
  GET_LEADERBOARD = 'get_leaderboard',
  GET_LEADER_ENTRY = 'get_leader_entry',
  INIT_LEADER_ENTRY = 'init_leader_entry',
  AWARD_POINTS = 'award_points',
  CARD_SPECIFIC = 'card',
}

export interface IRequest {
  id: number;
  event: IncomingEvents;
  data?: any;
}

export interface IMessage {
  id?: number;
  event: OutgoingEvents;
  data?: any;
}

export interface ILeaderboardRequest {
  leaderboard: string;
  limit?: number;
}

export interface ILeaderEntryRequest {
  leaderboard: string;
}

export interface IAwardPointsRequest {
  leaderboards: string[];
  amount: number;
}
