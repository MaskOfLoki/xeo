import {
  IAction,
  ICard,
  IConfig,
  IParticipation,
  IState,
  IUser,
  MobilePreviewMode,
  IGame,
  IWowzaService,
  IAdminDrivenEvent,
  IAwardedCoupon,
} from '../../../../../common/common';
import { IGCLeader } from '@gamechangerinteractive/xc-backend';
import { IXCChatMessage } from '../../../../../common/types/IXCChatMessage';
import { IIntegratedGameData, ISessionPlaybackStatus } from '../../utils';
import { IUserGroupsService } from './user-groups/IUserGroupsService';
import { IChatService } from './chat/IChatService';

export interface IWorkerAPIService extends IWowzaService {
  readonly userGroups: IUserGroupsService;
  readonly chat: IChatService;

  init(
    cid: string,
    previewMode: MobilePreviewMode,
    channel: string,
    stateCallback: (value: IState) => void,
    configCallback: (value: IConfig) => void,
    pointsCallback: (value: IGCLeader) => void,
    couponCallback: (value: IAwardedCoupon) => void,
    bannedCallback: (value: boolean) => void,
    chatReactionCallback: (value: any) => void,
    adminEventCallback: (value: IAdminDrivenEvent) => void,
  ): Promise<void>;
  isLoggedIn(): Promise<IUser>;
  loginAnonymously(): Promise<IUser>;
  markFrontgate(): void;
  submitThumbsCardAnswer(card: ICard, up: boolean): Promise<void>;
  getThumbsCardAnswer(card: ICard): Promise<boolean>;
  time(): Promise<number>;
  getParticipation(card: ICard, ignoreCache?: boolean): Promise<IParticipation>;
  submitCardView(card: ICard): Promise<void>;
  submitApplauseCardClap(card: ICard, dif: number): Promise<number>;
  getApplauseCardClaps(card: ICard): Promise<number>;
  submitSliderCardValue(card: ICard, value: number, oldValue: number): Promise<void>;
  getSliderCardValue(card: ICard): Promise<number>;
  submitPollCardAnswer(card: ICard, answer: string): Promise<void>;
  getPollCardAnswer(card: ICard): Promise<string>;
  getRandomActions(id: string, count: number): Promise<IAction[]>;
  verifyPhone(phone: string): Promise<void>;
  verifyPhoneCode(code: string): Promise<IUser>;
  updateUser(update: Partial<IUser>): Promise<void>;
  isUsernameAvailable(value: string): Promise<boolean>;
  getLeaders(leaderboard: string, limit?: number): Promise<IGCLeader[]>;
  getLeaderEntry(leaderboard: string): Promise<IGCLeader>;
  initLeaderEntry(leaderboard: string): Promise<IGCLeader>;
  submitSounderCardValue(card: ICard, value: { [index: number]: number }, isFirstSubmit: boolean): Promise<void>;
  getAwardedCoupons(): Promise<IAwardedCoupon[]>;
  awardSocialSharing(card: ICard): Promise<void>;
  awardPoints(amount: number, leaderboards: string[]): Promise<IGCLeader[]>;
  getGames(): Promise<IGame[]>;
  writeAction(cardId: number, type: string, payload?: any): Promise<void>;
  getSessionPosition(): Promise<number>;
  updateSessionPosition(value: number): Promise<void>;
  isSessionPaused(): Promise<boolean>;
  isUserBanned(): Promise<boolean>;
  toggleSessionPlayback(playing: boolean): Promise<void>;
  getSessionPlaybackStatus(): Promise<ISessionPlaybackStatus>;
  onChatReaction(callback: any): Promise<void>;
  submitChatMessage(message: string): Promise<void>;
  submitChatReaction(messageId: string, action: string): Promise<any>;
  getMessageReactions(): Promise<any>;
  getMessageHistory(): Promise<IXCChatMessage[]>;
  submitIntegratedGamePoints(value: number, data: IIntegratedGameData): Promise<void>;
  watchSingleUser(callback: VoidFunction): Promise<void>;
  verifyLeaderboardData(): Promise<void>;
}
