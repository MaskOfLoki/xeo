import { proxy, wrap } from 'comlink';
import { redraw, route } from 'mithril';
import { Observable, ReplaySubject, Subject } from 'rxjs';

import {
  IAction,
  ICard,
  IConfig,
  IGame,
  IParticipation,
  IState,
  IUser,
  IWowzaService,
  MobilePreviewMode,
  IAdminDrivenEvent,
  AdminDrivenEvents,
} from '../../../../../common/common';
import { loading } from '../../../../../common/loading';
import { PopupManager } from '../../../../../common/popups/PopupManager';
import { IGCAwardedCoupon } from '@gamechangerinteractive/xc-backend/types/IGCAwardedCoupon';
import { IGCLeader } from '@gamechangerinteractive/xc-backend/types/IGCLeader';
import { CouponPopup } from '../../components/coupon-popup';
import { IWorkerAPIService } from './IWorkerAPIService';
import { getChannel, getPreviewMode, getQueryParam, isPreview } from '../../../../../common/utils/query';
import { IIntegratedGameData, ISessionPlaybackStatus, swalAlert } from '../../utils';
import { APIChatService } from './chat/APIChatService';
import { APIUserGroupsService } from './user-groups/APIUserGroupsService';
import { IXCChatMessage } from '../../../../../common/types/IXCChatMessage';

export class APIService implements IWowzaService {
  private _clientId: string;
  private _worker: IWorkerAPIService;
  private _user: IUser;
  private _timeDif = 0;
  private _adminEvent;
  private _adminEventData: any;
  private readonly _banned: Subject<boolean> = new ReplaySubject(1);
  private readonly _stateSubject: Subject<IState> = new ReplaySubject(1);
  private readonly _configSubject: Subject<IConfig> = new ReplaySubject(1);
  private readonly _userSubject: Subject<IUser> = new ReplaySubject(1);
  private readonly _pointsSubject: Subject<IGCLeader> = new ReplaySubject(1);
  private readonly _chatReactionSubject: Subject<any> = new ReplaySubject(1);

  public readonly state: Observable<IState> = this._stateSubject;
  public readonly config: Observable<IConfig> = this._configSubject;
  public readonly user: Observable<IUser> = this._userSubject;
  public readonly points: Observable<IGCLeader> = this._pointsSubject;
  public readonly chatReaction: Observable<any> = this._chatReactionSubject;
  public readonly banned: Observable<boolean> = this._banned;
  private _chat: APIChatService;
  private _userGroups: APIUserGroupsService;

  public async init(): Promise<void> {
    let clientId: string;
    this._banned.next(false);

    if (!GC_PRODUCTION) {
      clientId = getQueryParam('gcClientId');
    } else {
      clientId = window.location.host.split('.')[0];
    }
    this._clientId = clientId;

    const previewMode: MobilePreviewMode = getPreviewMode();

    if (!isNaN(previewMode) && previewMode !== MobilePreviewMode.EVENT) {
      const { preview } = await import('../PreviewService');
      this._worker = preview;
    } else {
      const WorkerClass = wrap(new Worker('./WorkerAPIService', { type: 'module' })) as any;
      this._worker = await loading.wrap(new WorkerClass());
    }

    await loading.wrap(
      this._worker.init(
        clientId,
        previewMode,
        getChannel(),
        proxy((value) => this.stateHandler(value)),
        proxy((value) => this.configHandler(value)),
        proxy((value) => {
          this._pointsSubject.next(value);
          redraw();
        }),
        proxy((value) => this.couponHandler(value)),
        proxy((value) => this._banned.next(value)),
        proxy((value) => this.chatReactionHandler(value)),
        proxy((event: IAdminDrivenEvent) => this.adminEventHandler(event)),
      ),
    );

    this._chat = new APIChatService(this._worker.chat);
    this._userGroups = new APIUserGroupsService(this._worker.userGroups);
  }

  public async isLoggedIn(): Promise<IUser> {
    this._user = await loading.wrap(this._worker.isLoggedIn());
    this.initUser();
    return this._user;
  }

  public async loginAnonymously(): Promise<void> {
    this._user = await loading.wrap(this._worker.loginAnonymously());
    this.initUser();
  }

  private async timeSyncHandler() {
    const now = await this._worker.time();
    this._timeDif = Date.now() - now;
    setTimeout(this.timeSyncHandler.bind(this), 60000);
  }

  public markFrontgate(): void {
    this._worker.markFrontgate();
  }

  public verifyPhone(phone: string): Promise<void> {
    return loading.wrap(this._worker.verifyPhone(phone));
  }

  public async verifyPhoneCode(code: string): Promise<IUser> {
    this._user = await loading.wrap(this._worker.verifyPhoneCode(code));
    this.initUser();
    return this._user;
  }

  public verifyLeaderboardData(): Promise<void> {
    return this._worker.verifyLeaderboardData();
  }

  private initUser() {
    if (!this._user) {
      return;
    }

    this._userSubject.next(this._user);
    this.timeSyncHandler();

    if (!isPreview()) {
      this._worker.watchSingleUser(proxy(() => this.showMultiInstancesMessage()));
    }
  }

  private showMultiInstancesMessage() {
    route.set('/splash');
    return swalAlert({
      icon: 'error',
      text: `Looks like you're running other instances of XEO. Please, close them and refresh the page.`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
    });
  }

  private configHandler(value: IConfig) {
    this._configSubject.next(value);
    redraw();
  }

  private stateHandler(value: IState) {
    this._stateSubject.next(value);
    redraw();
  }

  private chatReactionHandler(value: IXCChatMessage) {
    this._chatReactionSubject.next(value);
  }

  private couponHandler(coupon: IGCAwardedCoupon) {
    PopupManager.show(CouponPopup, { coupon });
  }

  public onChatReaction(callback: any): Promise<void> {
    return loading.wrap(this._worker.onChatReaction(callback));
  }

  public submitChatReaction(messageId: string, action: string): Promise<any> {
    return loading.wrap(this._worker.submitChatReaction(messageId, action));
  }

  public submitChatMessage(message: string): Promise<void> {
    return loading.wrap(this._worker.submitChatMessage(message));
  }

  public getMessageHistory(): Promise<IXCChatMessage[]> {
    return this._worker.getMessageHistory();
  }

  public getMessageReactions(): Promise<any> {
    return this._worker.getMessageReactions();
  }

  public submitThumbsCardAnswer(card: ICard, up: boolean): Promise<void> {
    return loading.wrap(this._worker.submitThumbsCardAnswer(card, up));
  }

  public getThumbsCardAnswer(card: ICard): Promise<boolean> {
    return loading.wrap(this._worker.getThumbsCardAnswer(card));
  }

  public submitCardView(card: ICard): Promise<void> {
    return loading.wrap(this._worker.submitCardView(card));
  }

  public submitApplauseCardClap(card: ICard, dif: number): Promise<number> {
    return this._worker.submitApplauseCardClap(card, dif);
  }

  public getApplauseCardClaps(card: ICard): Promise<number> {
    return loading.wrap(this._worker.getApplauseCardClaps(card));
  }

  public getParticipation(card: ICard, ignoreCache?: boolean): Promise<IParticipation> {
    return this._worker.getParticipation(card, ignoreCache);
  }

  public submitSliderCardValue(card: ICard, value: number, oldValue: number): Promise<void> {
    return this._worker.submitSliderCardValue(card, value, oldValue);
  }

  public getSliderCardValue(card: ICard): Promise<number> {
    return loading.wrap(this._worker.getSliderCardValue(card));
  }

  public submitPollCardAnswer(card: ICard, answer: string): Promise<void> {
    return loading.wrap(this._worker.submitPollCardAnswer(card, answer));
  }

  public getPollCardAnswer(card: ICard): Promise<string> {
    return loading.wrap(this._worker.getPollCardAnswer(card));
  }

  public getRandomActions(id: string, count: number): Promise<IAction[]> {
    return this._worker.getRandomActions(id, count);
  }

  public async updateUser(update: Partial<IUser>): Promise<void> {
    await loading.wrap(this._worker.updateUser(update));
    Object.assign(this._user, update);
    this._userSubject.next(this._user);
  }

  public isUsernameAvailable(value: string): Promise<boolean> {
    return loading.wrap(this._worker.isUsernameAvailable(value));
  }

  public getLeaders(leaderboard: string, limit?: number): Promise<IGCLeader[]> {
    return loading.wrap(this._worker.getLeaders(leaderboard, limit));
  }

  public initLeaderEntry(leaderboard: string): Promise<IGCLeader> {
    return this._worker.initLeaderEntry(leaderboard);
  }

  public getLeaderEntry(leaderboard: string): Promise<IGCLeader> {
    return loading.wrap(this._worker.getLeaderEntry(leaderboard));
  }

  public submitSounderCardValue(
    card: ICard,
    value: { [index: number]: number },
    isFirstSubmit: boolean,
  ): Promise<void> {
    return this._worker.submitSounderCardValue(card, value, isFirstSubmit);
  }

  public getAwardedCoupons(): Promise<IGCAwardedCoupon[]> {
    return loading.wrap(this._worker.getAwardedCoupons());
  }

  public awardSocialSharing(card: ICard): Promise<void> {
    return loading.wrap(this._worker.awardSocialSharing(card));
  }

  public awardPoints(amount: number, leaderboards: string[]): Promise<IGCLeader[]> {
    return this._worker.awardPoints(amount, leaderboards);
  }

  public getGames(): Promise<IGame[]> {
    return loading.wrap(this._worker.getGames());
  }

  public time(): number {
    return Date.now() - this._timeDif;
  }

  public writeAction(cardId: number, type: string, payload?: any): Promise<void> {
    return this._worker.writeAction(cardId, type, payload);
  }

  public getSessionPosition(): Promise<number> {
    return loading.wrap(this._worker.getSessionPosition());
  }

  public updateSessionPosition(value: number): Promise<void> {
    return this._worker.updateSessionPosition(value);
  }

  public isSessionPaused(): Promise<boolean> {
    return loading.wrap(this._worker.isSessionPaused());
  }

  public toggleSessionPlayback(playing: boolean): Promise<void> {
    return loading.wrap(this._worker.toggleSessionPlayback(playing));
  }

  public getSessionPlaybackStatus(): Promise<ISessionPlaybackStatus> {
    return loading.wrap(this._worker.getSessionPlaybackStatus());
  }

  public isUserBanned(): Promise<boolean> {
    return loading.wrap(this._worker.isUserBanned());
  }

  public submitIntegratedGamePoints(value: number, data: IIntegratedGameData): Promise<void> {
    return loading.wrap(this._worker.submitIntegratedGamePoints(value, data));
  }

  public startRTMPStream(id: string): Promise<void> {
    return this._worker.startRTMPStream(id);
  }

  public getRTMPStreamState(id: string): Promise<string> {
    return this._worker.getRTMPStreamState(id);
  }

  public get uid(): string {
    return this._user.uid;
  }

  public get cid(): string {
    return this._clientId;
  }

  public get chat(): APIChatService {
    return this._chat;
  }

  public get userGroups(): APIUserGroupsService {
    return this._userGroups;
  }

  public get adminEventData() {
    return this._adminEventData;
  }

  public get adminEvent() {
    return this._adminEvent;
  }

  private adminEventHandler(message: IAdminDrivenEvent): void {
    this._adminEvent = message.type;
    switch (message.type) {
      case AdminDrivenEvents.CLEAR:
        this._adminEventData = null;
        break;
      case AdminDrivenEvents.DISPLAY_LEADERBOARD:
        this._adminEventData = message.data;
        route.set('/rank');
        break;
      case AdminDrivenEvents.RETURN_HOME:
        this._adminEventData = null;
        if (route.get().includes('rank')) {
          //console.log("AdminDrivenEvent.Home");
          route.set('/home');
        }
        break;
    }
  }
}
