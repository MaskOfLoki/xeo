import { IWorkerAPIService } from './IWorkerAPIService';
import { expose, proxy } from 'comlink';
import {
  CardStatus,
  CardStopMode,
  GAME_ID,
  ICard,
  IParticipation,
  IState,
  IConfig,
  IMainboardState,
  MainboardLayout,
  MainboardDisplay,
  IMarketingMessage,
  CardTransition,
  MainboardBackgroundVideoStatus,
  IPreset,
  IChannel,
  IProject,
  IGame,
  ITimelineCard,
  MainboardZone,
  ITimeline,
  CardType,
  ITargetCard,
  IRTMPStream,
  IUser,
  ITeamPlayConfig,
  IAdminDrivenEvent,
  AdminDrivenEvents,
} from '../../../../../common/common';
import { isEmptyString, uuid, cloneObject, deepMerge, randInt } from '@gamechangerinteractive/xc-backend/utils';
import { removeNulls, deepSet, delay } from '../../../../../common/utils';
import axios from 'axios';
import {
  ILeadersRequest,
  IPaginatedLeadersRequest,
  IPaginatedLeadersResponse,
  IPrizesHoldersInfo,
  IResetLeadersRequest,
} from '../../utils';
import { gcBackend, IGCCoupon, IGCUser, IGCLeader } from '@gamechangerinteractive/xc-backend';
import { Operation } from 'fast-json-patch';

import ENV from '../../../../../common/utils/environment';
import { WowzaService } from '../../../../../common/utils/WowzaService';
import { SmsService } from '../SmsService';
import { EmailService } from '../EmailService';
import { UserGroupService } from '../UserGroupService';
import { ISnapshotService } from './snapshots/ISnapshotService';
import { WorkerSnapshotsService } from './snapshots/WorkerSnapshotsService';
import { WorkerTurboTriviaService } from './turbo-trivia/WorkerTurboTriviaService';
import { GCLeaderboards } from '@gamechangerinteractive/xc-backend/GCLeaderboards';

const PRESET_PROJECT = 'project';
const PRESET_RTMP_STREAM = 'rtmp-stream';

class WorkerAPIService implements IWorkerAPIService {
  private _cachedGames: IGame[];
  private _cachedRTMPStreams: IRTMPStream[] = [];
  private _wowza: WowzaService = new WowzaService();
  private _sms: SmsService = new SmsService();
  private _email: EmailService = new EmailService();
  private _userGroupsService = new UserGroupService();

  public readonly turbotrivia: WorkerTurboTriviaService = new WorkerTurboTriviaService();
  public readonly snapshots: ISnapshotService = new WorkerSnapshotsService();

  public async login(cid: string, secret: string): Promise<boolean> {
    await gcBackend.init({
      cid,
      gid: GAME_ID,
      buildNum: BUILD_NUM,
      pubnub: {
        // TODO: retrieve publishKey from admin-only firestore doc
        publishKey: 'pub-c-6a8ee5a3-f1dd-4c73-b3f9-377576cba026',
      },
      admin: true,
      firebaseAppName: 'admin',
      env: ENV,
    });

    if (isEmptyString(secret)) {
      const isLoggedIn = await gcBackend.auth.isLoggedIn();

      if (!isLoggedIn) {
        return false;
      }
    } else {
      await gcBackend.auth.loginUID(secret);
    }

    await this.turbotrivia.login(cid, gcBackend.auth.uid);

    return gcBackend.auth.isAdmin();
  }

  public async isSingleAdmin(): Promise<boolean> {
    const channelGroup = `${gcBackend.cid}-${gcBackend.gid}-admin`;
    const { totalOccupancy } = await gcBackend.pubnub.hereNow({
      channelGroups: [channelGroup],
    });

    const channels = await gcBackend.pubnub.listChannels(channelGroup);

    if (channels.length > 2) {
      await gcBackend.pubnub.removeChannelsFromGroup(channels.slice(0, channels.length - 2), channelGroup);
    }

    const channel = `${channelGroup}-${Date.now()}`;
    await gcBackend.pubnub.addChannelsToGroup([channel], channelGroup);

    gcBackend.pubnub.subscribe(
      {
        channel,
        withPresence: true,
      },
      () => {
        // we subscribe to the channel just to track amount of users
      },
    );

    return totalOccupancy === 0;
  }

  public watchState<T extends IState>(callback: (value: T) => void, namespace: string[]): any {
    const unwatch = gcBackend.state.watch<T>((value) => {
      if (value.channel?.cards) {
        value.channel.cards.forEach((card) => {
          if (card.status == null) {
            card.status = CardStatus.INACTIVE;
          }

          if (card.stopMode == null) {
            card.stopMode = CardStopMode.AUTO;
          }
        });
      }

      if (!value.marketingMessages) {
        value.marketingMessages = [];
      }

      callback(value);
    }, ...namespace);
    return proxy(() => unwatch());
  }

  public watchConfig<T>(callback: (value: T) => void, namespace: string[]): any {
    const unwatch = gcBackend.config.watch<T>((value) => {
      const ns = namespace[namespace.length - 1];

      if (ns && !ns.endsWith('mainboard')) {
        this.fixNonMainboardConfig(ns);
      }

      callback(value);
    }, ...namespace);
    return proxy(() => unwatch());
  }

  public async getPresets(type: string): Promise<IPreset[]> {
    const snapshot = await gcBackend.firestore.collection(`games/${GAME_ID}/presets`).where('type', '==', type).get();
    const presets: IPreset[] = snapshot.docs.map((doc) => {
      const result: IPreset = doc.data() as IPreset;
      result.id = doc.id;
      return result;
    });

    if (type === PRESET_PROJECT) {
      const promises = [];

      for (const preset of presets) {
        let needSave: boolean;

        (preset as IProject).channels.forEach((channel) => {
          if (fixDuplicatedIds(channel.cards)) {
            needSave = true;
          }
        });

        if (needSave) {
          promises.push(this.savePreset(preset));
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }
    }

    return presets;
  }

  public async savePreset(value: IPreset): Promise<void> {
    if (isEmptyString(value.id)) {
      throw new Error('WorkerAPIService.savePreset: id is empty');
    }

    if (isEmptyString(value.type)) {
      throw new Error('WorkerAPIService.savePreset: type is empty');
    }

    removeNulls(value);
    const promises = [];

    if (value.type === PRESET_PROJECT) {
      const project: IProject = value as IProject;

      project.channels.forEach((channel) => {
        fixDuplicatedIds(channel.cards);

        if (channel.online) {
          const state = gcBackend.state.get<IState>(channel.id) ?? {};

          if (state.sid) {
            const oldChannel = state.channel;
            channel.cards.forEach((card) => {
              const oldCard = oldChannel.cards.find((c) => c.id === card.id);

              if (oldCard?.status !== undefined) {
                card.status = oldCard.status;
              }
            });
            channel.timeline = oldChannel.timeline;
            state.channel = channel;
            promises.push(gcBackend.state.set(state, channel.id));
          }
        }
      });
    }

    promises.push(gcBackend.firestore.doc(`games/${GAME_ID}/presets/${value.id}`).set(value));

    await Promise.all(promises);
  }

  public deletePreset(value: IPreset): Promise<void> {
    return gcBackend.firestore.doc(`games/${GAME_ID}/presets/${value.id}`).delete();
  }

  public async startChannel(channel: IChannel): Promise<void> {
    const state = {
      sid: uuid(),
      channel,
      marketingMessages: gcBackend.state.get<IState>(channel.id)?.marketingMessages ?? [],
      startTime: await this.time(),
      showMarketingMessages: true,
    };

    await gcBackend.redis.batch(['hset', `${gcBackend.gid}.states`, state.sid, JSON.stringify(state)]);

    return gcBackend.state.set(state, channel.id);
  }

  public async stopChannel(channel: IChannel): Promise<void> {
    const state = gcBackend.state.get<IState>(channel.id) ?? {};

    if (!isEmptyString(state.sid)) {
      state.stopTime = await this.time();
      const channelId = isEmptyString(channel.id) ? 'default' : channel.id;
      await gcBackend.redis.batch(
        ['hset', `${gcBackend.gid}.states`, state.sid, JSON.stringify(state)],
        ['sadd', `${gcBackend.gid}.states.${channelId}`, JSON.stringify(state)],
      );
    }

    await Promise.all([
      gcBackend.state.set(
        {
          marketingMessages: state.marketingMessages,
        },
        channel.id,
      ),
      gcBackend.state.set({}, `${channel.id}mainboard`),
    ]);
  }

  public async getStatesByChannel(channelId: string): Promise<IState[]> {
    const states: IState[] = await this.getAllStates();
    return states.filter((item) => item?.channel?.id === channelId);
  }

  private async deleteStateByChannel(channelId: string, sid: string) {
    if (isEmptyString(channelId)) {
      channelId = 'default';
    }

    const key = `${gcBackend.gid}.states.${channelId}`;
    const data = await gcBackend.redis.smembers(key);
    const state = data.find((item) => JSON.parse(item).sid === sid);
    return gcBackend.redis.srem(key, state);
  }

  private async getAllStates(): Promise<IState[]> {
    const values = await gcBackend.redis.hgetall(`${gcBackend.gid}.states`);

    if (!values) {
      return [];
    }

    const result: IState[] = Object.values(values).map((value: string) => JSON.parse(value));
    result.sort((s1, s2) => s2.startTime - s1.startTime);
    return result;
  }

  public async getPrizeHoldersInfos(): Promise<IPrizesHoldersInfo[]> {
    const result: IState[] = await this.getAllStates();

    const users = await gcBackend.redis.batch(
      ...result.map((state) => ['zcard', `leaderboards.${gcBackend.gid}.${state.sid}`]),
    );

    return result.map((state, index) => {
      return {
        state,
        users: users[index],
      };
    });
  }

  public async deleteState(state: IState): Promise<void> {
    await Promise.all([
      this.deleteStateByChannel(state.channel.id, state.sid),
      gcBackend.redis.hdel(`${gcBackend.gid}.states`, state.sid),
    ]);
  }

  public async playCard(cardId: number, channelId: string): Promise<void> {
    const state = gcBackend.state.get<IState>(channelId);
    const channel = state.channel;
    const index = channel.cards.findIndex((item) => item.id === cardId);

    for (let i = 0; i < channel.cards.length; i++) {
      const card = channel.cards[i];

      if (card.status === CardStatus.LIVE) {
        card.status = CardStatus.DONE;
        const timelineCard: ICard = channel.timeline.cards[channel.timeline.cards.length - 1];

        if (!timelineCard) {
          console.warn(`WorkerAPIService.playCard: timelineCard isn't defined`);
          continue;
        }

        timelineCard.status = CardStatus.DONE;
        timelineCard.stopTimer = (await this.time()) - state.startTime - card.startTime;
      }
    }

    const card = channel.cards[index];
    const timelineCard = cloneObject(card) as ITimelineCard;
    timelineCard.status = CardStatus.LIVE;
    timelineCard.startTime = (await this.time()) - state.startTime;
    channel.timeline.cards.push(timelineCard);

    card.status = CardStatus.LIVE;
    card.startTime = timelineCard.startTime;

    return gcBackend.state.set(state, channelId);
  }

  public async stopCard(cardId: number, channelId: string): Promise<void> {
    const state = gcBackend.state.get<IState>(channelId);
    const channel = state.channel;
    const card = channel.cards.find((item) => item.id === cardId);
    card.status = CardStatus.DONE;
    const timelineCard = channel.timeline.cards[channel.timeline.cards.length - 1];

    if (timelineCard) {
      timelineCard.status = CardStatus.DONE;
      timelineCard.stopTimer = (await this.time()) - state.startTime - card.startTime;
    } else {
      console.warn(`WorkerAPIService.stopCard: timelineCard isn't defined`);
    }

    // we need to keep updates as small as possible,
    // so instead of sending whole channel, we send only updated portion
    return gcBackend.state.set(state, channelId);
  }

  public async resetCard(cardId: number, channelId: string): Promise<void> {
    const state = gcBackend.state.get<IState>(channelId);
    const card = state.channel.cards.find((item) => item.id === cardId);
    const promises = [];
    promises.push(this.wipeCardParticipation(cardId, channelId));

    if (card.type === CardType.TARGET) {
      const c: ITargetCard = card as ITargetCard;
      c.entries.forEach((entry) => promises.push(this.wipeCardParticipation(entry.card.id, channelId)));
    }

    await Promise.all(promises);
    card.status = CardStatus.INACTIVE;
    // we need to keep updates as small as possible,
    // so instead of sending whole channel, we send only updated portion
    return gcBackend.state.set(state, channelId);
  }

  public async wipeCardParticipation(cardId: number, channelId: string) {
    const state = gcBackend.state.get<IState>(channelId);
    const hash = `${gcBackend.gid}.${state.sid}.card.${cardId}`;
    const keys = await gcBackend.redis.keys(`${hash}*`);
    keys.push(hash);
    return gcBackend.redis.del(...keys);
  }

  public async getCardsParticipation(cards: ICard[], channelId: string): Promise<IParticipation[]> {
    const state = gcBackend.state.get<IState>(channelId);
    const { data } = await axios.get(ENV.XEO_FEED_URL, {
      params: {
        c: gcBackend.cid,
        s: state.sid,
        i: cards.map((card) => card.id),
        t: cards.map((card) => card.type),
      },
      paramsSerializer,
    });

    return Array.isArray(data) ? data : [data];
  }

  public time(): Promise<number> {
    return gcBackend.time.now();
  }

  public uploadFile(ref: string, value: File): Promise<string> {
    return gcBackend.storage.put(ref, value);
  }

  public deleteFile(url: string): Promise<void> {
    return gcBackend.storage.delete(url);
  }

  private get redisCouponsKey(): string {
    return `${gcBackend.gid}.coupons`;
  }

  public async getCoupons(): Promise<IGCCoupon[]> {
    const values: string[] = await gcBackend.redis.hvals(this.redisCouponsKey);

    if (!values) {
      return [];
    }

    return values.map((value: string) => {
      const result = JSON.parse(value);

      if (isEmptyString(result.gid)) {
        result.gid = GAME_ID;
      }

      return result;
    });
  }

  public async saveCoupon(coupon: IGCCoupon): Promise<unknown> {
    if (isEmptyString(coupon.id)) {
      throw new Error('Empty coupon id');
    }

    return gcBackend.redis.hset(this.redisCouponsKey, coupon.id, JSON.stringify(coupon));
  }

  public async deleteCoupon(couponId: string): Promise<void> {
    if (isEmptyString(couponId)) {
      throw new Error('Empty coupon id');
    }

    return gcBackend.redis.hdel(this.redisCouponsKey, couponId);
  }

  public async getPaginatedLeaders(value: IPaginatedLeadersRequest): Promise<IPaginatedLeadersResponse> {
    return gcBackend.leaderboards.call('getPaginatedLeaders', value);
  }

  public getLeaders(leaderboard: string, limit?: number): Promise<IGCLeader[]> {
    return gcBackend.leaderboards.getLeaders(leaderboard, limit);
  }

  public getRandomLeaders(channel: string, leaderboard: string, limit: number): Promise<IPaginatedLeadersResponse> {
    return gcBackend.leaderboards.call('getRandomLeaders', channel, leaderboard, limit);
  }

  public resetLeaderboard(request: IResetLeadersRequest): Promise<void> {
    request.lid = `${GAME_ID}.${request.lid ?? 'overall'}`;

    return gcBackend.leaderboards.call('reset', request);
  }

  private getCurrentLeaderboards(): string[] {
    const leaderboards: string[] = [GCLeaderboards.OVERALL];

    return leaderboards;
  }

  public awardPointsToSelectedUsers(amount: number, uids: string[], leaderboard: string): Promise<IGCLeader[]> {
    const promises = uids
      .map((uid) => gcBackend.leaderboards.adminAdd(amount, [leaderboard], uid))
      .map((promise) => promise.then((result) => result[0]));
    return Promise.all(promises);
    //return gcBackend.leaderboards.add(amount, leaderboards);
  }

  public awardSelectedUsers(coupon: IGCCoupon, sid: string, uids: string[]): Promise<void> {
    return gcBackend.coupons.award(coupon, sid, ...uids);
  }

  public async awardEveryone(coupon: IGCCoupon, request: ILeadersRequest): Promise<void> {
    const awardedCoupon = await gcBackend.coupons.createAwardedCoupon(coupon, undefined);
    delete awardedCoupon.sid;
    await gcBackend.coupons.call('awardEveryoneLMS', awardedCoupon, request);
    await gcBackend.pubnub.publish({
      channel: `${gcBackend.cid}-${GAME_ID}-awards`,
      message: Date.now(),
    });
  }

  public async getCouponsAwardedTo(userId: string): Promise<IGCCoupon[]> {
    const serializedCoupons: string[] = await gcBackend.coupons.call('getAwardedTo', GAME_ID, userId);
    return serializedCoupons.map((s) => JSON.parse(s) as IGCCoupon);
  }

  public async setConfig(config: IConfig, namespace: string): Promise<void> {
    return gcBackend.config.set(config, namespace);
  }

  public async updateConfig(update: Partial<IConfig>, namespace: string): Promise<void> {
    const config: IConfig = gcBackend.config.get(namespace);
    deepMerge(config, update);
    return gcBackend.config.set(config, namespace);
  }

  public async setConfigField(field: string, value: any, namespace: string): Promise<void> {
    const config: IConfig = gcBackend.config.get(namespace);
    deepSet(field, config, value);
    return gcBackend.config.set(config, namespace);
  }

  public async getUser(username: string): Promise<IGCUser[]> {
    const result = await gcBackend.firestore.collection('users').where('username', '==', username).get();
    return result.docs.map((doc) => doc.data()) as IGCUser[];
  }

  public async banUser(userId: string, channelId: string): Promise<void> {
    await gcBackend.leaderboards.banUser(userId);
    // TODO: This should be moved into gcBackend.leaderboards.banUser
    return gcBackend.pubnub.publish({
      channel: `${gcBackend.cid}.${GAME_ID}.${channelId}bans`,
      message: { uid: userId, type: 'ban' },
    });
  }

  public async unbanUser(userId: string, channelId: string): Promise<void> {
    await gcBackend.leaderboards.unbanUser(userId);
    // TODO: This should be moved into gcBackend.leaderboards.unbanUser
    return gcBackend.pubnub.publish({
      channel: `${gcBackend.cid}.${GAME_ID}.${channelId}bans`,
      message: { uid: userId, type: 'unban' },
    });
  }

  public getBannedUsers(): Promise<IGCUser[]> {
    return gcBackend.leaderboards.getBannedUsers();
  }

  public async overrideMainboardLeaders(leaders: IGCLeader[], channelId: string): Promise<void> {
    const state: IMainboardState = gcBackend.state.get<IMainboardState>(`${channelId}mainboard`);

    if (state.overriddenLeaderboard || leaders) {
      const op = !state.overriddenLeaderboard ? 'add' : leaders ? 'replace' : 'remove';
      return gcBackend.state.update(
        [{ op: op, value: leaders, path: '/overriddenLeaderboard' }],
        `${channelId}mainboard`,
      );
    }

    state.overriddenLeaderboard = leaders;
    await this.fixMainboardState(state, channelId);
  }

  public async restoreMainboardLeaders(channelId: string): Promise<void> {
    return this.overrideMainboardLeaders(undefined, channelId);
  }

  public async updateMainboardLayoutAndZone(
    layout: MainboardLayout,
    zone: MainboardZone,
    channelId: string,
  ): Promise<void> {
    const state: IMainboardState = gcBackend.state.get<IMainboardState>(`${channelId}mainboard`);
    const update: Operation[] = [];

    if (state.layout !== layout) {
      update.push({
        op: 'add',
        value: layout,
        path: '/layout',
      });
    }

    if (state.zone !== zone) {
      update.push({
        op: 'add',
        value: zone,
        path: '/zone',
      });

      update.push({
        op: 'add',
        value: zone,
        path: `/${layout}_zone`,
      });
    }

    if (update.length > 0) {
      await this.fixMainboardState(state, channelId);
      return gcBackend.state.update(update, `${channelId}mainboard`);
    }
  }

  public async updateMainboardDisplay(
    display: MainboardDisplay,
    layout: MainboardLayout,
    zone: MainboardZone,
    channelId: string,
  ): Promise<void> {
    const state: IMainboardState = gcBackend.state.get<IMainboardState>(`${channelId}mainboard`);
    const update: Operation[] = [];

    if (state.layout !== layout) {
      update.push({
        op: 'add',
        value: layout,
        path: '/layout',
      });
    }

    if (state.zone !== zone) {
      update.push({
        op: 'add',
        value: zone,
        path: '/zone',
      });
    }

    if (state.display !== display) {
      update.push({
        op: 'add',
        value: display,
        path: '/display',
      });
    }

    if (update.length > 0) {
      await this.fixMainboardState(state, channelId);
      return gcBackend.state.update(update, `${channelId}mainboard`);
    }
  }

  public async updateMainboardZone(zone: MainboardZone, channelId: string): Promise<void> {
    const state: IMainboardState = gcBackend.state.get<IMainboardState>(`${channelId}mainboard`);
    const update: Operation[] = [];

    if (state.zone !== zone) {
      update.push({
        op: 'add',
        value: zone,
        path: '/zone',
      });
    }

    if (update.length > 0) {
      await this.fixMainboardState(state, channelId);
      return gcBackend.state.update(update, `${channelId}mainboard`);
    }
  }

  public async updateMainboardCustomCard(customCard: ICard, channelId: string): Promise<void> {
    const namespace = `${channelId}mainboard`;
    const state: IMainboardState = gcBackend.state.get<IMainboardState>(namespace);
    const update: Operation[] = [];

    if (!customCard) {
      update.push({
        op: 'remove',
        path: '/customCard',
      });
    }

    if (customCard) {
      update.push({
        op: 'add',
        value: customCard,
        path: '/customCard',
      });

      if (state.display !== MainboardDisplay.CUSTOM_CARD) {
        update.push({
          op: 'add',
          value: MainboardDisplay.CUSTOM_CARD,
          path: '/display',
        });
      }
    } else if (state.display === MainboardDisplay.CUSTOM_CARD) {
      update.push({
        op: 'add',
        value: MainboardDisplay.CURRENT_CARD,
        path: '/display',
      });
    }

    await this.fixMainboardState(state, channelId);
    return gcBackend.state.update(update, namespace);
  }

  public saveMarketingMessage(value: IMarketingMessage, channelId: string): Promise<void> {
    let state: IState = gcBackend.state.get<IState>(channelId);

    if (!state) {
      state = {};
    }

    if (!state.marketingMessages) {
      state.marketingMessages = [];
    }

    if (state.marketingMessages.length === 0) {
      state.marketingMessages.push(value);
    } else {
      let index: number = state.marketingMessages.findIndex((item) => item.id === value.id);

      if (index === -1) {
        index = state.marketingMessages.length;
      }

      state.marketingMessages[index] = value;
    }

    return gcBackend.state.set(state, channelId);
  }

  public deleteMarketingMessage(value: IMarketingMessage, channelId: string): Promise<void> {
    const state: IState = gcBackend.state.get<IState>(channelId);
    const index: number = state.marketingMessages.findIndex((item) => item?.id === value.id);

    if (index === -1) {
      return;
    }

    state.marketingMessages.splice(index, 1);

    return gcBackend.state.set(state, channelId);
  }

  public toggleMarketingMessages(value: boolean, channelId: string): Promise<void> {
    const state: IState = gcBackend.state.get<IState>(channelId);

    if (value) {
      state.showMarketingMessages = true;
    } else {
      state.showMarketingMessages = false;
    }

    return gcBackend.state.set(state, channelId);
  }

  public updateCardTransition(cardId: number, transition: CardTransition, channelId: string): Promise<void> {
    const state: IMainboardState = gcBackend.state.get<IMainboardState>(channelId);
    const card: ICard = state.channel.cards.find((item) => item.id === cardId);

    if (!card) {
      return;
    }

    if (transition === CardTransition.NONE) {
      card.transition = undefined;
    } else {
      card.transition = transition;
    }

    return gcBackend.state.set(state, channelId);
  }

  public async getOnlineUsers(channelId: string): Promise<number> {
    if (isEmptyString(channelId)) {
      channelId = 'default';
    }

    try {
      const { totalOccupancy } = await gcBackend.pubnub.hereNow({
        channels: [`${gcBackend.cid}-${GAME_ID}-${channelId}-presence`],
      });

      return totalOccupancy;
    } catch {
      return 0;
    }
  }

  public async updateMainboardVideoStatus(
    backgroundVideoStatus: MainboardBackgroundVideoStatus,
    channelId: string,
  ): Promise<void> {
    const namespace = `${channelId}mainboard`;
    const state: IMainboardState = gcBackend.state.get<IMainboardState>(namespace);
    await this.fixMainboardState(state, channelId);

    return gcBackend.state.update(
      [
        {
          op: 'add',
          value: backgroundVideoStatus,
          path: '/backgroundVideoStatus',
        },
      ],
      namespace,
    );
  }

  public async getGames(): Promise<IGame[]> {
    if (this._cachedGames) {
      return this._cachedGames;
    }

    const result = await gcBackend.firestore.global.collection(`public/clients/${gcBackend.cid}/games`).get();

    const games: IGame[] = [];

    result.forEach((doc) => {
      const game: IGame = doc.data() as IGame;

      if (!game.enabled || game.xeoDisabled) {
        return;
      }

      games.push(game);
    });

    return (this._cachedGames = games);
  }

  public async toggleChannelPlay(value: boolean, channelId: string): Promise<void> {
    const state: IState = gcBackend.state.get<IState>(channelId);
    const now = await this.time();

    if (value) {
      if (state.pausedTime) {
        state.startTime = now - (state.pausedTime - state.startTime);
        state.pausedTime = undefined;
        return gcBackend.state.set(state, channelId);
      }
    } else {
      state.pausedTime = now;
      return gcBackend.state.set(state, channelId);
    }
  }

  public async seekProgrammedChannel(channelId: string, position: number): Promise<void> {
    if (position < 0) {
      position = 0;
    }

    const now = await this.time();

    return gcBackend.state.update(
      [
        {
          op: 'add',
          path: '/startTime',
          value: now - position,
        },
      ],
      channelId,
    );
  }

  public saveTimeline(channelId: string, timeline: ITimeline): Promise<void> {
    return gcBackend.redis.hset(
      `${gcBackend.gid}.saved-timelines`,
      sanitizeChannelId(channelId),
      JSON.stringify(timeline),
    ) as Promise<void>;
  }

  public async getSavedTimeline(channelId: string): Promise<ITimeline> {
    const result = await gcBackend.redis.hget<string>(`${gcBackend.gid}.saved-timelines`, sanitizeChannelId(channelId));

    if (result) {
      return JSON.parse(result);
    }
  }

  public deleteSavedTimeline(channelId: string): Promise<void> {
    return gcBackend.redis.hdel(`${gcBackend.gid}.saved-timelines`, sanitizeChannelId(channelId));
  }

  public async createRTMPStream(name: string, url: string): Promise<IRTMPStream> {
    this._cachedRTMPStreams = [];
    const result = await this._wowza.create(url);
    const stream: IRTMPStream = {
      id: result.id,
      playerId: result.player_id,
      streamUrl: result.player_hls_playback_url,
      sourceUrl: url,
      name,
      type: PRESET_RTMP_STREAM,
    };

    await this.savePreset(stream);
    return stream;
  }

  public async removeRTMPStream(id: string): Promise<void> {
    this._cachedRTMPStreams = [];
    await Promise.all([
      this._wowza.remove(id),
      this.deletePreset({
        id,
        name: '',
        type: PRESET_RTMP_STREAM,
      }),
    ]);
  }

  public startRTMPStream(id: string): Promise<void> {
    return this._wowza.start(id);
  }

  public getRTMPStreamState(id: string): Promise<string> {
    return this._wowza.state(id);
  }

  public async getRTMPStreams(): Promise<IRTMPStream[]> {
    if (this._cachedRTMPStreams.length === 0) {
      this._cachedRTMPStreams = (await this.getPresets(PRESET_RTMP_STREAM)) as IRTMPStream[];
    }

    return this._cachedRTMPStreams;
  }

  // the method should be removed in a couple releases after 0.9
  private async fixMainboardState(value: IMainboardState, channelId: string) {
    const state = gcBackend.state.get<IState>(channelId);

    for (const s in state) {
      if (s in value) {
        delete value[s];
      }
    }

    return gcBackend.state.set(value, `${channelId}mainboard`);
  }

  // the method should be removed in a couple releases after 0.9
  private fixNonMainboardConfig(channelId: string) {
    const value: IConfig = gcBackend.config.get(channelId) ?? {};

    if (!('mainboard' in value)) {
      return;
    }

    return gcBackend.config
      .update(
        [
          {
            op: 'remove',
            path: '/mainboard',
          },
        ],
        channelId,
      )
      .catch((e) => console.warn('WorkerAPIService.fixNonMainboardConfig', e));
  }

  public watchProject(callback: (value: IProject) => void): Promise<VoidFunction> {
    const unwatch = gcBackend.firestore
      .collection(`games/${GAME_ID}/presets`)
      .where('type', '==', 'project')
      .onSnapshot((snapshot) => {
        for (const doc of snapshot.docs) {
          const project: IProject = doc.data() as IProject;

          if (project.name === 'DEFAULT') {
            return callback(project);
          }
        }

        callback(undefined);
      });

    return Promise.resolve(proxy(() => unwatch()));
  }

  public sendSms(phones: string[], message: string, image?: string): Promise<void> {
    return this._sms.send(phones, message, image);
  }

  public sendSmsInQueue(phones: string[], message: string, image?: string): Promise<number> {
    return this._sms.sendInQueue(phones, message, image);
  }

  public getSmsSentCount(queueId: number): Promise<number> {
    return this._sms.getSentCount(queueId);
  }

  public async getSMSUsers(): Promise<IUser[]> {
    const snaphsot = await gcBackend.firestore.collection('users').where('optIn', '==', true).get();

    const users: IUser[] = [];
    snaphsot.docs.forEach((doc) => {
      const data = doc.data() as IUser;
      if (data.phone) {
        users.push(data);
      }
    });

    return users;
  }

  public sendEmail(recipients: string[], subject: string, htmlBody: string): Promise<void> {
    return this._email.send(recipients, subject, htmlBody);
  }

  public markAdminAction(action: string, data?: any) {
    const entry: any = {
      type: 'ADMIN_ACTION',
      action,
    };

    if (data !== undefined) {
      entry.data = data;
    }

    gcBackend.analytics.addEntry(entry);
  }

  public loadChannelTeamsConfig(channelId: string): Promise<ITeamPlayConfig> {
    return this._userGroupsService.loadChannelTeamsConfig(channelId);
  }

  public saveChannelTeamsConfig(channelId: string, config: ITeamPlayConfig): Promise<void> {
    return this._userGroupsService.saveChannelTeamsConfig(channelId, config);
  }

  public async forceLeaderboard(leadeboard: IGCLeader[], channelId: string): Promise<void> {
    await gcBackend.pubnub.publish({
      channel: `${gcBackend.cid}.${GAME_ID}.${channelId}adminEvents`,
      message: {
        type: AdminDrivenEvents.DISPLAY_LEADERBOARD,
        data: leadeboard,
      },
    });

    await delay(10000);
    await gcBackend.pubnub.publish({
      channel: `${gcBackend.cid}-${GAME_ID}-adminEvents`,
      message: {
        type: AdminDrivenEvents.CLEAR,
      },
    });
  }

  public async sendMobileLeaderboard(state: IMainboardState, channelId: string): Promise<void> {
    if (state.customLeaderboard) {
      await gcBackend.pubnub.publish({
        channel: `${gcBackend.cid}.${GAME_ID}.${channelId}adminEvents`,
        message: {
          type: AdminDrivenEvents.DISPLAY_LEADERBOARD,
          data: state.overriddenLeaderboard,
        },
      });
    } else {
      await gcBackend.pubnub.publish({
        channel: `${gcBackend.cid}.${GAME_ID}.${channelId}adminEvents`,
        message: {
          type: AdminDrivenEvents.RETURN_HOME,
        },
      });
    }

    return gcBackend.state.set(state, `${channelId}mainboard`);
  }
}

function sanitizeChannelId(value: string): string {
  if (isEmptyString(value)) {
    value = 'default';
  }

  return value;
}

function paramsSerializer(params) {
  let options = '';
  for (const key in params) {
    if (typeof params[key] !== 'object' && params[key]) {
      options += `${key}=${params[key]}&`;
    } else if (typeof params[key] === 'object' && params[key] && params[key].length) {
      params[key].forEach((el) => {
        options += `${key}=${el}&`;
      });
    }
  }
  return options ? options.slice(0, -1) : options;
}

function fixDuplicatedIds(cards: ICard[]): boolean {
  let result = false;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    while (cards.find((item, index) => index !== i && item.id === card.id)) {
      card.id = randInt(1000000000);
      result = true;
    }
  }

  return result;
}

expose(WorkerAPIService);
