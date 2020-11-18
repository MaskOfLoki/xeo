import {
  ICard,
  IParticipation,
  IState,
  MainboardLayout,
  MainboardDisplay,
  IMarketingMessage,
  CardTransition,
  MainboardBackgroundVideoStatus,
  IPreset,
  IChannel,
  IGame,
  ITimeline,
  MainboardZone,
  IRTMPStream,
  IWowzaService,
  IProject,
  IUser,
  ITeamPlayConfig,
  IMainboardState,
} from '../../../../../common/common';
import {
  ILeadersRequest,
  IPaginatedLeadersRequest,
  IPaginatedLeadersResponse,
  IPrizesHoldersInfo,
  IResetLeadersRequest,
} from '../../utils';
import { IGCCoupon, IGCLeader, IGCUser } from '@gamechangerinteractive/xc-backend';
import { ISnapshotService } from './snapshots/ISnapshotService';
import { ITurboTriviaService } from './turbo-trivia/ITurboTriviaService';

export interface IWorkerAPIService extends IWowzaService {
  readonly turbotrivia: ITurboTriviaService;
  readonly snapshots: ISnapshotService;
  watchState<T>(callback: (value: T) => void, namespaces: string[]): Promise<VoidFunction>;

  watchConfig<T>(callback: (value: T) => void, namespaces: string[]): Promise<VoidFunction>;

  login(id: string, secret: string): Promise<boolean>;

  startChannel(value: IChannel): Promise<void>;

  stopChannel(value: IChannel): Promise<void>;

  playCard(cardId: number, channelId: string): Promise<void>;

  stopCard(cardId: number, channelId: string): Promise<void>;

  resetCard(cardId: number, channelId: string): Promise<void>;

  getCardsParticipation(cards: ICard[], channelId: string): Promise<IParticipation[]>;

  time(): Promise<number>;

  uploadFile(ref: string, value: File): Promise<string>;

  deleteFile(url: string): Promise<void>;

  getPrizeHoldersInfos(): Promise<IPrizesHoldersInfo[]>;

  deleteState(state: IState): Promise<void>;

  getCoupons(): Promise<IGCCoupon[]>;

  awardPointsToSelectedUsers(amount: number, uids: string[], leadeboard: string): Promise<IGCLeader[]>;

  awardSelectedUsers(coupon: IGCCoupon, sid: string, uids: string[]): Promise<void>;

  awardEveryone(coupon: IGCCoupon, request: ILeadersRequest): Promise<void>;

  getCouponsAwardedTo(userId: string): Promise<IGCCoupon[]>;

  setConfigField<T>(field: string, setValue: T, namespace: string): Promise<void>;

  setConfig<T>(update: T, namespace: string): Promise<void>;

  updateConfig<T>(update: Partial<T>, namespace: string): Promise<void>;

  getLeaders(leaderboard: string, limit?: number): Promise<IGCLeader[]>;

  getUser(username: string): Promise<IGCUser[]>;

  banUser(userId: string, channelId: string): Promise<void>;

  unbanUser(userId: string, channelId: string): Promise<void>;

  getBannedUsers(): Promise<IGCUser[]>;

  getPresets(type: string): Promise<IPreset[]>;

  savePreset(value: IPreset): Promise<void>;

  deletePreset(value: IPreset): Promise<void>;

  getOnlineUsers(channelId: string): Promise<number>;

  updateMainboardLayoutAndZone(layout: MainboardLayout, zone: MainboardZone, channelId: string): Promise<void>;

  updateMainboardDisplay(
    display: MainboardDisplay,
    layout: MainboardLayout,
    zone: MainboardZone,
    channelId: string,
  ): Promise<void>;

  updateMainboardZone(zone: MainboardZone, channelId: string): Promise<void>;

  updateMainboardCustomCard(value: ICard, channelId: string): Promise<void>;

  saveMarketingMessage(value: IMarketingMessage, channelId: string): Promise<void>;

  deleteMarketingMessage(value: IMarketingMessage, channelId: string): Promise<void>;

  toggleMarketingMessages(value: boolean, channelId: string): Promise<void>;

  updateCardTransition(cardId: number, transition: CardTransition, channelId: string): Promise<void>;

  isSingleAdmin(): Promise<boolean>;

  updateMainboardVideoStatus(value: MainboardBackgroundVideoStatus, channelId: string): Promise<void>;

  getGames(): Promise<IGame[]>;

  toggleChannelPlay(value: boolean, channelId: string): Promise<void>;

  getStatesByChannel(channelId: string): Promise<IState[]>;

  saveTimeline(channelId: string, timeline: ITimeline): Promise<void>;

  getSavedTimeline(channelId: string): Promise<ITimeline>;

  deleteSavedTimeline(channelId: string): Promise<void>;

  seekProgrammedChannel(channelId: string, position: number): Promise<void>;

  wipeCardParticipation(cardId: number, channelId: string): Promise<void>;

  createRTMPStream(name: string, url: string): Promise<IRTMPStream>;

  removeRTMPStream(id: string): Promise<void>;

  getRTMPStreams(): Promise<IRTMPStream[]>;

  saveCoupon(coupon: IGCCoupon): Promise<unknown>;

  deleteCoupon(couponId: string): Promise<void>;

  watchProject(callback: (value: IProject) => void): Promise<VoidFunction>;

  getPaginatedLeaders(value: IPaginatedLeadersRequest): Promise<IPaginatedLeadersResponse>;

  sendEmail(recipients: string[], subject: string, htmlBody: string): Promise<void>;

  getRandomLeaders(channel: string, leaderboard: string, limit: number): Promise<IPaginatedLeadersResponse>;

  sendSms(phones: string[], message: string, image?: string): Promise<void>;

  sendSmsInQueue(phones: string[], message: string, image?: string): Promise<number>;

  getSmsSentCount(queueId: number): Promise<number>;

  getSMSUsers(): Promise<IUser[]>;

  overrideMainboardLeaders(leaders: IGCLeader[], channelId: string): Promise<void>;

  restoreMainboardLeaders(channelId: string): Promise<void>;

  resetLeaderboard(request: IResetLeadersRequest): Promise<void>;

  markAdminAction(action: string, data?: any);

  loadChannelTeamsConfig(channelId: string): Promise<ITeamPlayConfig>;

  saveChannelTeamsConfig(channelId: string, config: ITeamPlayConfig): Promise<void>;

  forceLeaderboard(leadeboard: IGCLeader[], channelId: string): Promise<void>;

  sendMobileLeaderboard(state: IMainboardState, channelId: string): Promise<void>;
}
