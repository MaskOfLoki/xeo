import { IWorkerAPIService } from './IWorkerAPIService';
import { proxy, wrap } from 'comlink';
import Swal from 'sweetalert2';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';
import { redraw } from 'mithril';
import { getFieldValue } from '../../../../../common/utils';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { gcLocalStorage } from '@gamechangerinteractive/xc-backend';
import {
  ICard,
  IParticipation,
  IState,
  IConfig,
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
import { loading } from '../../../../../common/loading';
import {
  ILeadersRequest,
  IPaginatedLeadersRequest,
  IPaginatedLeadersResponse,
  IPrizesHoldersInfo,
  IResetLeadersRequest,
  toPromise,
} from '../../utils';
import { IGCCoupon, IGCLeader, IGCUser } from '@gamechangerinteractive/xc-backend';
import { liveCard } from '../../../../../common/utils/live-card';
import { ISnapshotService } from './snapshots/ISnapshotService';
import { APISnapshotsService } from './snapshots/APISnapshotsService';
import { APITurboTriviaService } from './turbo-trivia/APITurboTriviaService';

// TODO: split into smaller subservices, see snapshots as an example
export class APIService implements IWowzaService {
  private _cid: string;
  private _worker: IWorkerAPIService;
  private _timeDif = 0;
  private _states: Map<string, Observable<any>> = new Map();
  private _configs: Map<string, Observable<any>> = new Map();

  private readonly _subjectProject: Subject<IProject> = new ReplaySubject(1);

  public readonly project: Observable<IProject> = this._subjectProject;

  private _turbotrivia: APITurboTriviaService;
  private _snapshots: ISnapshotService;

  public async init(): Promise<void> {
    // eslint-disable-next-line
    const WorkerClass = wrap(new Worker('./WorkerAPIService', { type: 'module' })) as any;
    this._worker = await loading.wrap(new WorkerClass());
    this._snapshots = new APISnapshotsService(this._worker.snapshots);
    this._turbotrivia = new APITurboTriviaService(this._worker.turbotrivia);
    const cid = await gcLocalStorage.getItem<string>('gc.cid');

    if (isEmptyString(cid)) {
      return this.showLoginSettings();
    }

    const result = await this.login(cid);

    if (!result) {
      return this.showLoginSettings();
    } else {
      this.checkSingleAdmin();
      liveCard.init(this as any);
      this._worker.watchProject(proxy((value) => this._subjectProject.next(value)));
    }
  }

  public async showLoginSettings(reload?: boolean) {
    const cid: string = await gcLocalStorage.getItem<string>('gc.cid');

    await Swal.fire({
      title: 'Settings',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Client ID" value="${cid || ''}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Client Secret">`,
      focusConfirm: false,
      preConfirm: this.settingsPreConfirmHandler.bind(this, reload),
      allowOutsideClick: false,
      allowEscapeKey: true,
      showCloseButton: true,
    });
  }

  private async settingsPreConfirmHandler(reload?: boolean): Promise<void> {
    Swal.resetValidationMessage();
    const id = (document.getElementById('swal-input1') as HTMLInputElement).value.trim();

    if (isEmptyString(id)) {
      Swal.showValidationMessage('Client ID is empty');
      return;
    }

    const secret = (document.getElementById('swal-input2') as HTMLInputElement).value.trim();

    if (isEmptyString(secret)) {
      Swal.showValidationMessage('Client Secret is empty');
      return;
    }

    const isAdmin = await this.login(id, secret);

    if (isAdmin) {
      await gcLocalStorage.setItem('gc.cid', id);

      if (reload) {
        location.reload();
      } else {
        this.checkSingleAdmin();
        loading.wrap(toPromise(this.state('')));
        loading.wrap(toPromise(this.turbotrivia.state('')));
        this.timeSyncHandler();
        liveCard.init(this as any);
        this._worker.watchProject(proxy((value) => this._subjectProject.next(value)));
      }
    } else {
      Swal.showValidationMessage('Invalid Client ID or Client Secret');
    }
  }

  private async timeSyncHandler() {
    const now = await this._worker.time();
    this._timeDif = Date.now() - now;
    setTimeout(this.timeSyncHandler.bind(this), 60000);
  }

  private async checkSingleAdmin() {
    if (!GC_PRODUCTION) {
      return;
    }

    const result = await this._worker.isSingleAdmin();

    if (!result) {
      Swal.fire({
        title:
          'Ignore this message if you have just refreshed the page. It appears that another admin app is currently open. Please only use a single admin at a time to avoid data corruption.',
        icon: 'warning',
      });
    }
  }

  private async login(id: string, secret?: string): Promise<boolean> {
    const result = await loading.wrap(this._worker.login(id, secret));
    this._cid = id;
    return result;
  }

  public state<T>(...namespace: string[]): Observable<T> {
    let result: Observable<T> = this._states.get(namespace.join('-'));

    if (result) {
      return result;
    }

    const subject: Subject<T> = new Subject();

    this._worker.watchState<T>(
      proxy((value) => {
        subject.next(value);
        redraw();
      }),
      namespace,
    );

    // TODO: implement unwatch
    result = subject.pipe(publishReplay(1), refCount());
    this._states.set(namespace.join('-'), result);
    return result;
  }

  public config<T>(...namespace: string[]): Observable<T> {
    let result: Observable<T> = this._configs.get(namespace.join('-'));

    if (result) {
      return result;
    }

    const subject: BehaviorSubject<any> = new BehaviorSubject({});

    this._worker.watchConfig<T>(
      proxy((value) => {
        subject.next(value);
        redraw();
      }),
      namespace,
    );

    result = subject.asObservable().pipe(publishReplay(1), refCount());

    this._configs.set(namespace.join('-'), result);
    return result;
  }

  public startChannel(channel: IChannel): Promise<void> {
    channel.cards.forEach((card) => {
      delete card.status;
    });
    return loading.wrap(this._worker.startChannel(channel));
  }

  public stopChannel(channel: IChannel): Promise<void> {
    return loading.wrap(this._worker.stopChannel(channel));
  }

  public playCard(cardId: number, channelId: string): Promise<void> {
    return loading.wrap(this._worker.playCard(cardId, channelId));
  }

  public stopCard(cardId: number, channelId: string): Promise<void> {
    return loading.wrap(this._worker.stopCard(cardId, channelId));
  }

  public resetCard(cardId: number, channelId: string): Promise<void> {
    return loading.wrap(this._worker.resetCard(cardId, channelId));
  }

  public async getParticipation(card: ICard, channelId: string) {
    const result = await this.getCardsParticipation([card], channelId);
    return result[0];
  }

  public getCardsParticipation(cards: ICard[], channelId: string): Promise<IParticipation[]> {
    return this._worker.getCardsParticipation(cards, channelId);
  }

  public time(): number {
    return Date.now() - this._timeDif;
  }

  public uploadFile(ref: string, value: File): Promise<string> {
    return loading.wrap(this._worker.uploadFile(ref, value));
  }

  public deleteFile(url: string): Promise<void> {
    return loading.wrap(this._worker.deleteFile(url));
  }

  public getPrizeHoldersInfos(): Promise<IPrizesHoldersInfo[]> {
    return loading.wrap(this._worker.getPrizeHoldersInfos());
  }

  public deleteState(state: IState): Promise<void> {
    return loading.wrap(this._worker.deleteState(state));
  }

  public getCoupons(): Promise<IGCCoupon[]> {
    return loading.wrap(this._worker.getCoupons());
  }

  public saveCoupon(coupon: IGCCoupon): Promise<unknown> {
    return loading.wrap(this._worker.saveCoupon(coupon));
  }

  public deleteCoupon(couponId: string): Promise<void> {
    return loading.wrap(this._worker.deleteCoupon(couponId));
  }

  public getPaginatedLeaders(value: IPaginatedLeadersRequest): Promise<IPaginatedLeadersResponse> {
    return loading.wrap(this._worker.getPaginatedLeaders(value));
  }

  public awardPointsToSelectedUsers(amount: number, uids: string[], leaderboard: string): Promise<IGCLeader[]> {
    return loading.wrap(this._worker.awardPointsToSelectedUsers(amount, uids, leaderboard));
  }

  public awardSelectedUsers(coupon: IGCCoupon, sid: string, uids: string[]): Promise<void> {
    return loading.wrap(this._worker.awardSelectedUsers(coupon, sid, uids));
  }

  public awardEveryone(coupon: IGCCoupon, request: ILeadersRequest): Promise<void> {
    return loading.wrap(this._worker.awardEveryone(coupon, request));
  }

  public async getCouponsAwardedTo(userId: string): Promise<IGCCoupon[]> {
    return loading.wrap(this._worker.getCouponsAwardedTo(userId));
  }

  public setConfig(update: IConfig, namespace: string): Promise<void> {
    return this._worker.setConfig(update, namespace);
  }

  public updateConfig(update: Partial<IConfig>, namespace: string): Promise<void> {
    return this._worker.updateConfig(update, namespace);
  }

  public setConfigField<T>(field: string, value: T, namespace: string): Promise<void> {
    return this._worker.setConfigField(field, value, namespace);
  }

  public configField<T>(field: string, namespace: string): Observable<T> {
    return this.config(namespace).pipe(map((value) => getFieldValue(value, field)));
  }

  public getLeaders(leaderboard: string, limit?: number): Promise<IGCLeader[]> {
    return loading.wrap(this._worker.getLeaders(leaderboard, limit));
  }

  public getUser(username: string): Promise<IGCUser[]> {
    return loading.wrap(this._worker.getUser(username));
  }

  public banUser(userId: string, channelId: string): Promise<void> {
    return loading.wrap(this._worker.banUser(userId, channelId));
  }

  public unbanUser(userId: string, channelId: string): Promise<void> {
    return loading.wrap(this._worker.unbanUser(userId, channelId));
  }

  public getBannedUsers(): Promise<IGCUser[]> {
    return loading.wrap(this._worker.getBannedUsers());
  }

  public getPresets(type: string): Promise<IPreset[]> {
    return loading.wrap(this._worker.getPresets(type));
  }

  public savePreset(value: IPreset, showProgress = true): Promise<void> {
    const result = this._worker.savePreset(value);

    return showProgress ? loading.wrap(result) : result;
  }

  public deletePreset(value: IPreset): Promise<void> {
    return loading.wrap(this._worker.deletePreset(value));
  }

  public getOnlineUsers(channelId: string): Promise<number> {
    return this._worker.getOnlineUsers(channelId);
  }

  public updateMainboardLayoutAndZone(layout: MainboardLayout, zone: MainboardZone, channelId: string): Promise<void> {
    return this._worker.updateMainboardLayoutAndZone(layout, zone, channelId);
  }

  public updateMainboardZone(zone: MainboardZone, channelId: string): Promise<void> {
    return this._worker.updateMainboardZone(zone, channelId);
  }

  public updateMainboardDisplayLayoutZone(
    display: MainboardDisplay,
    layout: MainboardLayout,
    zone: MainboardZone,
    channelId: string,
  ): Promise<void> {
    return this._worker.updateMainboardDisplay(display, layout, zone, channelId);
  }

  public updateMainboardCustomCard(customCard: ICard, channelId: string): Promise<void> {
    return loading.wrap(this._worker.updateMainboardCustomCard(customCard, channelId));
  }

  public saveMarketingMessage(value: IMarketingMessage, channelId: string): Promise<void> {
    return loading.wrap(this._worker.saveMarketingMessage(value, channelId));
  }

  public deleteMarketingMessage(value: IMarketingMessage, channelId: string): Promise<void> {
    return loading.wrap(this._worker.deleteMarketingMessage(value, channelId));
  }

  public toggleMarketingMessages(value: boolean, channelId: string): Promise<void> {
    return loading.wrap(this._worker.toggleMarketingMessages(value, channelId));
  }

  public updateCardTransition(cardId: number, transition: CardTransition, channelId: string): Promise<void> {
    return loading.wrap(this._worker.updateCardTransition(cardId, transition, channelId));
  }

  public updateMainboardVideoStatus(value: MainboardBackgroundVideoStatus, channelId: string): Promise<void> {
    return loading.wrap(this._worker.updateMainboardVideoStatus(value, channelId));
  }

  public getGames(): Promise<IGame[]> {
    return loading.wrap(this._worker.getGames());
  }

  public toggleChannelPlay(value: boolean, channelId: string): Promise<void> {
    return loading.wrap(this._worker.toggleChannelPlay(value, channelId));
  }

  public getStatesByChannel(channelId: string): Promise<IState[]> {
    return loading.wrap(this._worker.getStatesByChannel(channelId));
  }

  public saveTimeline(channelId: string, timeline: ITimeline): Promise<void> {
    return loading.wrap(this._worker.saveTimeline(channelId, timeline));
  }

  public getSavedTimeline(channelId: string): Promise<ITimeline> {
    return loading.wrap(this._worker.getSavedTimeline(channelId));
  }

  public deleteSavedTimeline(channelId: string): Promise<void> {
    return loading.wrap(this._worker.deleteSavedTimeline(channelId));
  }

  public seekProgrammedChannel(channelId: string, position: number): Promise<void> {
    return loading.wrap(this._worker.seekProgrammedChannel(channelId, position));
  }

  public wipeCardParticipation(cardId: number, channelId: string): Promise<void> {
    return loading.wrap(this._worker.wipeCardParticipation(cardId, channelId));
  }

  public createRTMPStream(name: string, url: string): Promise<IRTMPStream> {
    return loading.wrap(this._worker.createRTMPStream(name, url));
  }

  public removeRTMPStream(id: string): Promise<void> {
    return loading.wrap(this._worker.removeRTMPStream(id));
  }

  public startRTMPStream(id: string): Promise<void> {
    return loading.wrap(this._worker.startRTMPStream(id));
  }

  public getRTMPStreamState(id: string): Promise<string> {
    return this._worker.getRTMPStreamState(id);
  }

  public getRTMPStreams(): Promise<IRTMPStream[]> {
    return loading.wrap(this._worker.getRTMPStreams());
  }

  public markAdminAction(action: string, data?: any) {
    this._worker.markAdminAction(action, data);
  }

  public get cid(): string {
    return this._cid;
  }

  public sendSms(phones: string[], message: string, image?: string): Promise<void> {
    return this._worker.sendSms(phones, message, image);
  }

  public sendSmsInQueue(phones: string[], message: string, image?: string): Promise<number> {
    return this._worker.sendSmsInQueue(phones, message, image);
  }

  public getSmsSentCount(queueId: number): Promise<number> {
    return this._worker.getSmsSentCount(queueId);
  }

  public getSMSUsers(): Promise<IUser[]> {
    return this._worker.getSMSUsers();
  }

  public sendEmail(recipients: string[], subject: string, htmlBody: string): Promise<void> {
    return loading.wrap(this._worker.sendEmail(recipients, subject, htmlBody));
  }

  public getRandomLeaders(channel: string, leaderboard: string, limit: number): Promise<IPaginatedLeadersResponse> {
    return loading.wrap(this._worker.getRandomLeaders(channel, leaderboard, limit));
  }

  public resetLeaderboard(request: IResetLeadersRequest): Promise<void> {
    return loading.wrap(this._worker.resetLeaderboard(request));
  }

  public overrideMainboardLeaders(leaders: IGCLeader[], channelId: string): Promise<void> {
    return loading.wrap(this._worker.overrideMainboardLeaders(leaders, channelId));
  }

  public restoreMainboardLeaders(channelId: string): Promise<void> {
    return loading.wrap(this._worker.restoreMainboardLeaders(channelId));
  }

  public async loadChannelTeamsConfig(channelId: string): Promise<ITeamPlayConfig> {
    return loading.wrap(this._worker.loadChannelTeamsConfig(channelId));
  }

  public async saveChannelTeamsConfig(channelId: string, confg: ITeamPlayConfig): Promise<void> {
    return loading.wrap(this._worker.saveChannelTeamsConfig(channelId, confg));
  }

  public forceLeaderboard(leadeboard: IGCLeader[], channelId: string): Promise<void> {
    return loading.wrap(this._worker.forceLeaderboard(leadeboard, channelId));
  }

  public sendMobileLeaderboard(state: IMainboardState, channelId: string): Promise<void> {
    return loading.wrap(this._worker.sendMobileLeaderboard(state, channelId));
  }

  public get snapshots(): ISnapshotService {
    return this._snapshots;
  }

  public get turbotrivia(): APITurboTriviaService {
    return this._turbotrivia;
  }
}
