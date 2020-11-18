import axios from 'axios';
import { expose } from 'comlink';
import firebase from 'firebase/app';
import lru from 'tiny-lru';

import { GCLeaderboards } from '@gamechangerinteractive/xc-backend/GCLeaderboards';
import {
  CardStatus,
  CardStopMode,
  CardType,
  fillDefaultConfig,
  GAME_ID,
  IAction,
  IAdminDrivenEvent,
  IAwardedCoupon,
  ICard,
  IConfig,
  IGame,
  IGroupUserData,
  IMultipleChoiceSignupField,
  IParticipation,
  IState,
  ITriviaCard,
  IUser,
  IUserGroup,
  MobilePreviewMode,
  PointsType,
  SignupFieldType,
} from '../../../../../common/common';
import { IGCLeader } from '@gamechangerinteractive/xc-backend/types/IGCLeader';
import { fixDate, isAndroid, isEmptyString, isIOS, uuid } from '@gamechangerinteractive/xc-backend/utils';
import { IWorkerAPIService } from './IWorkerAPIService';
import { IIntegratedGameData, ISessionPlaybackStatus } from '../../utils';
import { gcBackend, gcLocalStorage } from '@gamechangerinteractive/xc-backend';
import { WowzaService } from '../../../../../common/utils/WowzaService';

import ENV from '../../../../../common/utils/environment';
import { propsToArray } from '../../../../../common/utils';
import { WorkerUserGroupsService } from './user-groups/WorkerUserGroupsService';
import { IChatService } from './chat/IChatService';
import { WorkerChatService } from './chat/WorkerChatService';
import { IXCChatMessage } from '../../../../../common/types/IXCChatMessage';

class WorkerAPIService implements IWorkerAPIService {
  private _stateCallback: (value: IState) => void;
  private _configCallback: (value: IConfig) => void;
  private _pointsCallback: (value: IGCLeader) => void;
  private _couponCallback: (value: IAwardedCoupon) => void;
  private _chatReactionCallback: (value: any) => void;
  private _bannedCallback: (value: any) => void;
  private _state: IState = {};
  private _config: IConfig = fillDefaultConfig();
  private _cachedParticipations = lru(100, 10000);
  private _verifyPhoneCode: (code: string) => Promise<IUser>;
  private _user: IUser;
  private _isPreviewMode: boolean;
  private _cache = lru(100, 10000);
  private _channel: string;
  private _loginTime: number;
  private _markedLoginForSession: boolean;
  private _wowza: WowzaService = new WowzaService();
  private _userGroups: WorkerUserGroupsService = new WorkerUserGroupsService();
  private _multipleSessionsDetected: boolean;

  public readonly userGroups: WorkerUserGroupsService = new WorkerUserGroupsService();
  private _chat: IChatService;

  public async init(
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
  ) {
    await gcBackend.init({
      cid,
      gid: GAME_ID,
      buildNum: BUILD_NUM,
      pubnub: {
        // TODO: retrieve publishKey from admin-only firestore doc
        publishKey: 'pub-c-6a8ee5a3-f1dd-4c73-b3f9-377576cba026',
      },
      firebaseAppName: previewMode === MobilePreviewMode.EVENT ? 'preview' : undefined,
      env: ENV,
    });

    this._channel = channel;
    this._isPreviewMode = previewMode != null && !isNaN(previewMode);
    this._stateCallback = stateCallback;
    this._configCallback = configCallback;
    this._pointsCallback = pointsCallback;
    this._couponCallback = couponCallback;
    this._chat = new WorkerChatService(channel, this);
    gcBackend.config.watch(this.configHandler.bind(this), 'common', this._channel);
    this._bannedCallback = bannedCallback;
    this._chatReactionCallback = chatReactionCallback;
    gcBackend.pubnub.subscribe(
      {
        channel: `${cid}.${GAME_ID}.leaderboard`,
      },
      async () => {
        let result;
        if (this._state?.sid) {
          result = await gcBackend.leaderboards.get(this._state.sid);
        } else {
          result = await gcBackend.leaderboards.get(GCLeaderboards.OVERALL);
        }
        this._pointsCallback(result);
      },
    );

    gcBackend.pubnub.subscribe(
      {
        channel: `${cid}.${GAME_ID}.${this._channel}bans`,
      },
      (banMessage: any) => {
        if (banMessage.uid === this._user?.uid) {
          this._bannedCallback(banMessage.type === 'ban');
        }
      },
    );

    gcBackend.pubnub.subscribe(
      {
        channel: `${gcBackend.cid}.${GAME_ID}.${this._channel}adminEvents`,
      },
      (message: any) => {
        if (message?.type) {
          adminEventCallback(message);
        }
      },
    );

    this.initChatReaction();

    if (this._isPreviewMode) {
      await this.initPreviewUser();
    }
  }

  private initChatReaction() {
    const client = this.getPubNubClient();
    if (!client) {
      return setTimeout(this.initChatReaction.bind(this), 1000);
    }
    client.addListener({
      messageAction: (action) => {
        this._chatReactionCallback(action);
      },
    });
  }

  private async initPreviewUser() {
    this._user = await gcBackend.auth.loginUID('preview');

    if (
      this._user.avatar == null ||
      isEmptyString(this._user.username) ||
      isEmptyString(this._user.phone) ||
      isEmptyString(this._user.email)
    ) {
      await this.updateUser({
        username: 'preview',
        phone: 'preview',
        email: 'preview',
        avatar: 0,
      });
    }

    gcBackend.state.watch(this.stateHandler.bind(this), this._channel);

    this._pointsCallback({
      points: 23000,
      position: 15,
      username: this._user.username,
      uid: this._user.uid,
    });
  }

  public async isLoggedIn(): Promise<IUser> {
    this._user = (await gcBackend.auth.isLoggedIn()) as IUser;

    if (!this._user || isEmptyString(this._user?.phone)) {
      gcBackend.pubnub.init(`anonymous${uuid()}`);
      return;
    }

    this.initUser();
    return this._user;
  }

  public async loginAnonymously(): Promise<IUser> {
    this._user = (await gcBackend.auth.loginAnonymously()) as IUser;
    this.initUser();
    return this._user;
  }

  private async initUser() {
    gcBackend.state.watch(this.stateHandler.bind(this), this._channel);
    this._loginTime = await this.time();

    setInterval(() => this.updateLastActive(), 60 * 1000);

    if (
      !isEmptyString(this._user?.username) &&
      ((!isEmptyString(this._user?.phone) && !isEmptyString(this._user?.email)) || this._config.signup.anonymous)
    ) {
      const updates: any = {
        username: this._user.username,
      };

      if (this._user.phone) {
        updates.phone = this._user.phone;
      }

      if (this._user.email) {
        updates.email = this._user.email;
      }

      await this.initLeaderboard(GCLeaderboards.OVERALL, updates);
    }

    this.refreshGroupLeaderboards();
    gcBackend.coupons.watch(this.couponHandler.bind(this));

    if (!this._isPreviewMode) {
      const channel: string = isEmptyString(this._channel) ? 'default' : this._channel;

      gcBackend.pubnub.subscribe(
        {
          channel: `${gcBackend.cid}-${GAME_ID}-${channel}-presence`,
        },
        () => {
          // nothing to do here
          // we subscribe user to dedicated channel to properly handle online users
        },
      );

      this._bannedCallback(await this.isUserBanned());
    }
  }

  private async refreshGroupLeaderboards() {
    const groups = await this.userGroups.getMyGroups();
    groups.forEach((group) => this.initLeaderboard(`${group.type}.${group._id}`, this._user));
  }

  private couponHandler(value: IAwardedCoupon) {
    this._couponCallback(value);
  }

  public markFrontgate(): void {
    gcBackend.analytics.frontGate();
  }

  private configHandler(value: IConfig) {
    this._config = fillDefaultConfig(value);

    this._config.signup.fields = this._config.signup.fields.filter((field) => {
      if (isEmptyString(field.name)) {
        return false;
      }

      if (
        field.type === SignupFieldType.MULTIPLE_CHOICE &&
        (field as IMultipleChoiceSignupField).options.some((option) => isEmptyString(option))
      ) {
        return false;
      }

      return true;
    });

    this._configCallback(this._config);
  }

  private async stateHandler(value: IState) {
    if (value.channel?.cards) {
      value.channel.cards.forEach((card) => {
        if (card.status == null) {
          card.status = CardStatus.INACTIVE;
        }

        if (card.stopMode == null) {
          card.stopMode = CardStopMode.AUTO;
        }

        if (card.status !== CardStatus.LIVE) {
          this._cachedParticipations.delete(card.id.toString());
        }
      });
    } else {
      this._cachedParticipations.clear();
    }

    if (!isEmptyString(value.sid) && value.sid !== this._state?.sid) {
      this.initEvent(value.sid);
    }

    if (!value.marketingMessages) {
      value.marketingMessages = [];
    }

    this._state = value;

    if (isEmptyString(value.sid)) {
      const result = await gcBackend.leaderboards.get(GCLeaderboards.OVERALL);
      this._pointsCallback(result);
    }

    // Make sure the user is marked as active in the current session
    if (!this._markedLoginForSession && this._state?.sid) {
      this._markedLoginForSession = true;
      this.updateLastActive();
    } else if (!this._state?.sid) {
      this._markedLoginForSession = false;
    }

    this._stateCallback(value);
  }

  private async initEvent(sid: string) {
    if (!this._user) {
      return;
    }

    if (!this._isPreviewMode) {
      gcBackend.analytics.startSession(sid);
    }

    const result = await this.initLeaderboard(sid, {
      username: this._user.username,
      phone: this._user.phone,
      email: this._user.email,
    });

    if (result) {
      this._pointsCallback(result);
    }

    const hash = `${gcBackend.gid}.${sid}.checkin`;
    const isCheckedIn = await gcBackend.redis.hget(hash, gcBackend.auth.uid);

    if (isCheckedIn) {
      return;
    }

    await gcBackend.redis.hset(hash, gcBackend.auth.uid, 1);
    this.addPoints(this._config.points.checkin, { type: PointsType.EVENT_CHECKIN });
  }

  public async onChatReaction(callback: any): Promise<void> {
    const client = this.getPubNubClient();
    client.addListener({
      chatAction: (action) => {
        callback(action);
      },
    });
    return Promise.resolve();
  }

  public async submitChatMessage(message: string): Promise<void> {
    const chatMessage: IXCChatMessage = {
      username: gcBackend.auth.username,
      uid: gcBackend.auth.uid,
      timestamp: await this.time(),
      message,
    };

    const user = gcBackend.auth.user as IUser;
    if (!isEmptyString(user.avatarUrl)) {
      chatMessage.avatarUrl = user.avatarUrl;
    } else {
      chatMessage.avatarId = user.avatar;
    }

    gcBackend.pubnub.publish({
      channel: `${gcBackend.cid}.${GAME_ID}.${this._channel}chat`,
      message: chatMessage,
    });
  }

  public submitChatReaction(messageId: string, action: string): Promise<any> {
    const client: any = this.getPubNubClient();
    return client.addMessageAction({
      channel: `${gcBackend.cid}.${GAME_ID}.${this._channel}chat`,
      messageTimetoken: messageId,
      action: {
        type: 'reaction',
        value: `${action}`,
      },
    });
  }

  public getPubNubClient(): any {
    return gcBackend.pubnub.client;
  }

  public getMessageReactions(): Promise<any> {
    const client: any = this.getPubNubClient();
    return client.getMessageActions({
      channel: `${gcBackend.cid}.${GAME_ID}.${this._channel}chat`,
      end: new Date(),
      limit: 1000,
    });
  }

  public getMessageHistory(): Promise<IXCChatMessage[]> {
    const client: any = this.getPubNubClient();
    return client
      .fetchMessages({
        channels: [`${gcBackend.cid}.${GAME_ID}.${this._channel}chat`],
        count: 250,
      })
      .then((response: any) => {
        const messages: Array<any> = Object.values(response.channels);
        return messages[0]?.map((item) => item.message) || [];
      });
  }

  public async submitThumbsCardAnswer(card: ICard, up: boolean): Promise<void> {
    const key = `${gcBackend.gid}.${this._state.sid}.card.${card.id}`;
    const direction = up ? 'up' : 'down';
    const hash = `${key}.${direction}`;
    await gcBackend.redis.batch(
      ['hset', hash, gcBackend.auth.uid, '1'],
      ['sadd', `${key}.action`, `${gcBackend.auth.uid}<=>${this._user.username}<=>${direction}`],
    );

    this.addPoints(this._config.points.thumbs, {
      type: PointsType.CARD,
      cardType: CardType.REACTION_THUMBS,
      response: up,
      cardId: card.id,
    });
  }

  public async getThumbsCardAnswer(card: ICard): Promise<boolean> {
    const hash = `${gcBackend.gid}.${this._state.sid}.card.${card.id}`;
    const result = await gcBackend.redis.batch(
      ['hget', `${hash}.up`, gcBackend.auth.uid],
      ['hget', `${hash}.down`, gcBackend.auth.uid],
    );

    if (result[0] === '1') {
      return true;
    } else if (result[1] === '1') {
      return false;
    }
  }

  public submitCardView(card: ICard): Promise<void> {
    if (this._isPreviewMode) {
      return Promise.resolve();
    }

    const key = `${gcBackend.gid}.${this._state.sid}.card.${card.id}`;
    const hash = `${key}.views`;
    return gcBackend.redis.batch(
      ['hset', hash, gcBackend.auth.uid, 1],
      ['sadd', `${key}.action`, `${gcBackend.auth.uid}<=>${this._user.username}<=>view`],
    ) as Promise<void>;
  }

  public async submitApplauseCardClap(card: ICard, dif: number): Promise<number> {
    const key = `${gcBackend.gid}.${this._state.sid}.card.${card.id}`;
    const result = await gcBackend.redis.batch(
      ['hincrby', `${key}.userClaps`, gcBackend.auth.uid, dif],
      ['rpush', `${key}.claps`, ...Array.from({ length: dif }).map(() => gcBackend.auth.uid)],
      ['sadd', `${key}.action`, `${gcBackend.auth.uid}<=>${this._user.username}<=>clap`],
    );
    this.addPoints(dif * this._config.points.applause, {
      type: PointsType.CARD,
      cardType: CardType.REACTION_APPLAUSE,
      response: dif,
      cardId: card.id,
    });
    return result[1];
  }

  public async getApplauseCardClaps(card: ICard): Promise<number> {
    const hash = `${gcBackend.gid}.${this._state.sid}.card.${card.id}.userClaps`;
    const result: number = await gcBackend.redis.hget(hash, gcBackend.auth.uid);
    return result || 0;
  }

  public async submitSliderCardValue(card: ICard, value: number, oldValue: number): Promise<void> {
    const hash = `${gcBackend.gid}.${this._state.sid}.card.${card.id}`;

    const commands = [
      ['srem', `${hash}.action`, `${gcBackend.auth.uid}<=>${this._user.username}<=>${oldValue}`],
      ['hdel', `${hash}.${oldValue}`, gcBackend.auth.uid],
      ['hset', `${hash}.${value}`, gcBackend.auth.uid, 1],
      ['hset', hash, gcBackend.auth.uid, value],
      ['sadd', `${hash}.action`, `${gcBackend.auth.uid}<=>${this._user.username}<=>${value}`],
    ];

    await gcBackend.redis.batch(...commands);
    const data: any = {
      type: PointsType.CARD,
      cardType: CardType.REACTION_SLIDER,
      response: value,
      cardId: card.id,
    };

    if (oldValue == null) {
      return this.addPoints(this._config.points.slider, data);
    } else {
      if (this._state?.channel?.id != null) {
        data.channel = this._state.channel.id;
      }

      return gcBackend.leaderboards.call(
        'updatePointsEntryData',
        (await this.getCurrentLeaderboards()).map((item) => `${GAME_ID}.${item}`),
        data,
      );
    }
  }

  public submitIntegratedGamePoints(value: number, data: IIntegratedGameData): Promise<void> {
    return this.addPoints(value, data);
  }

  private async addPoints(value: number, data) {
    if (value === 0 || this._isPreviewMode || this._multipleSessionsDetected) {
      return;
    }

    if (this._state?.channel?.id != null) {
      data.channel = this._state.channel.id;
    }

    const team = await this.userGroups.getTeam();
    if (team) {
      data.team = team._id;
    }

    if (this._user) {
      data.username = this._user.username;
      data.email = this._user.email;
      data.phone = this._user.phone;

      const signupFields = this._config?.signup?.fields ?? [];

      for (const signupField of signupFields) {
        if (data[signupField.name] == null && this._user[signupField.name] != null) {
          data[signupField.name] = this._user[signupField.name];
        }
      }
    }

    const [overallResult, sessionResult] = await gcBackend.leaderboards.add(
      value,
      await this.getCurrentLeaderboards(),
      data,
    );

    if (sessionResult) {
      this._pointsCallback(sessionResult);
    } else {
      this._pointsCallback(overallResult);
    }
  }

  private async getCurrentLeaderboards(): Promise<string[]> {
    const leaderboards: string[] = [GCLeaderboards.OVERALL];

    if (!isEmptyString(this._state?.sid)) {
      leaderboards.push(this._state.sid);
    }

    const groups: IUserGroup[] = await this.userGroups.getMyGroups();
    groups.forEach((group) => leaderboards.push(`${group.type}.${group._id}`));
    return leaderboards;
  }

  public async getSliderCardValue(card: ICard): Promise<number> {
    const hash = `${gcBackend.gid}.${this._state.sid}.card.${card.id}`;
    const result: string = await gcBackend.redis.hget(hash, gcBackend.auth.uid);

    if (!isEmptyString(result)) {
      return parseInt(result);
    }
  }

  public async submitPollCardAnswer(card: ICard, answer: string): Promise<void> {
    const hash = `${gcBackend.gid}.${this._state.sid}.card.${card.id}`;

    const commands = [
      ['hset', `${hash}.${answer}`, gcBackend.auth.uid, 1],
      ['hset', hash, gcBackend.auth.uid, answer],
      ['sadd', `${hash}.action`, `${gcBackend.auth.uid}<=>${this._user.username}<=>${answer}`],
    ];

    await gcBackend.redis.batch(...commands);

    if (card.type === CardType.TRIVIA) {
      const c: ITriviaCard = card as ITriviaCard;
      let points = this._config.points.poll;
      const correct = !!c.answers.find((item) => item.value === answer)?.correct;

      if (correct) {
        points *= 10;
      }

      this.addPoints(points, {
        type: PointsType.CARD,
        cardType: CardType.TRIVIA,
        response: answer,
        correct,
        cardId: card.id,
      });
    } else if (card.type === CardType.TRIVIA_IMAGE) {
      const c: ITriviaCard = card as ITriviaCard;
      let points = this._config.points.poll;
      const correct = !!c.answers[parseInt(answer)]?.correct;

      if (correct) {
        points *= 10;
      }

      this.addPoints(points, {
        type: PointsType.CARD,
        cardType: CardType.TRIVIA_IMAGE,
        response: answer,
        correct,
        cardId: card.id,
      });
    } else {
      this.addPoints(this._config.points.poll, {
        type: PointsType.CARD,
        cardType: card.type,
        response: answer,
        cardId: card.id,
      });
    }
  }

  public getPollCardAnswer(card: ICard): Promise<string> {
    const hash = `${gcBackend.gid}.${this._state.sid}.card.${card.id}`;
    return gcBackend.redis.hget(hash, gcBackend.auth.uid);
  }

  public async getRandomActions(id: string, count: number): Promise<IAction[]> {
    const key = `${gcBackend.gid}.${this._state.sid}.card.${id}.action`;
    const result = await gcBackend.redis.srandmember(key, count);
    return result
      .map((action: string) => {
        const [, username, value] = action.split('<=>');
        return { username, value };
      })
      .filter((item) => item.username !== 'preview');
  }

  public async getParticipation(card: ICard, ignoreCache?: boolean): Promise<IParticipation> {
    let result: IParticipation;

    if (!ignoreCache) {
      result = this._cachedParticipations.get(card.id.toString());

      if (result) {
        return result;
      }
    }

    const response = await axios.get(ENV.XEO_FEED_URL, {
      params: {
        c: gcBackend.cid,
        s: this._state.sid,
        i: card.id,
        t: card.type,
      },
    });

    result = response.data;
    this._cachedParticipations.set(card.id.toString(), result);
    return result;
  }

  public time(): Promise<number> {
    return gcBackend.time.now();
  }

  public async verifyPhone(phone: string): Promise<void> {
    if (GC_PRODUCTION) {
      this._verifyPhoneCode = (await gcBackend.auth.loginPhone(phone)) as (code: string) => Promise<IUser>;
    } else {
      this._verifyPhoneCode = async () => {
        const user = await gcBackend.auth.loginUID(`debuguser${phone}`);

        if (user.isNew) {
          this.addPoints(this._config.points.register, { type: PointsType.SIGN_UP });
        }

        if (isEmptyString(user.phone)) {
          await gcBackend.firestore.doc(`/users/${user.uid}`).update({ phone });
          user.phone = phone;
          return user;
        }
      };
    }
  }

  public async verifyPhoneCode(code: string): Promise<IUser> {
    this._user = await this._verifyPhoneCode(code);

    if (this._user) {
      this.initUser();
    }

    return this._user;
  }

  public updateUser(update: Partial<IUser>): Promise<void> {
    this.initLeaderboard(GCLeaderboards.OVERALL, update);

    if (!isEmptyString(this._state?.sid)) {
      this.initLeaderboard(this._state.sid, update);
    }

    for (const s in update) {
      if (update[s] == null) {
        update[s] = firebase.firestore.FieldValue.delete();
      }
    }

    if (!this._user) {
      this._user = update as IUser;
    } else {
      Object.assign(this._user, update);
    }

    return gcBackend.firestore.doc(`/users/${gcBackend.auth.uid}`).update(update);
  }

  public async isUsernameAvailable(value: string): Promise<boolean> {
    if (gcBackend.auth.username === value) {
      return true;
    }

    return gcBackend.auth.isUsernameAvailable(value);
  }

  public getLeaders(leaderboard: string, limit?: number): Promise<IGCLeader[]> {
    return gcBackend.leaderboards.getLeaders(leaderboard, limit);
  }

  public async getLeaderEntry(leaderboard: string): Promise<IGCLeader> {
    const result = await gcBackend.leaderboards.get(leaderboard);

    if (isEmptyString(result.username)) {
      result.username = this._user.username;
    }

    return result;
  }

  public async submitSounderCardValue(
    card: ICard,
    value: { [index: number]: number },
    isFirstSubmit: boolean,
  ): Promise<void> {
    const key = `${gcBackend.gid}.${this._state.sid}.card.${card.id}.`;
    const commands = [];

    if (isFirstSubmit) {
      commands.push(['hset', `${key}users`, gcBackend.auth.uid, 1]);
    }

    for (const s in value) {
      commands.push(['rpush', `${key}${s}`, ...Array.from({ length: value[s] }).map(() => gcBackend.auth.uid)]);
      commands.push(['sadd', `${key}action`, `${gcBackend.auth.uid}<=>${this._user.username}<=>${s}`]);
    }

    if (commands.length === 0) {
      return;
    }

    let total = 0;

    for (const entry of propsToArray<number>(value)) {
      total += entry;
    }

    (value as any).total = Object.values(value).reduce((a, b) => a + b, 0);

    this.addPoints(total * this._config.points.sounder, {
      type: PointsType.CARD,
      cardType: CardType.SOUNDER,
      response: value,
      cardId: card.id,
    });

    return gcBackend.redis.batch(...commands) as Promise<void>;
  }

  public async getAwardedCoupons(): Promise<IAwardedCoupon[]> {
    const result = (await gcBackend.coupons.getAwarded()) as IAwardedCoupon[];
    result.forEach((item) => {
      if (isEmptyString(item.gid)) {
        item.gid = GAME_ID;
      }
    });

    const snapshot = await gcBackend.firestore.collection('awarded-coupons').where('gid', '==', 'bingo').get();
    const bingoCoupons: IAwardedCoupon[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      data.awardedAt = fixDate(data.awardedTime);
      data.image = data.coupon.image.url;
      bingoCoupons.push(data as IAwardedCoupon);
    }

    result.push(...bingoCoupons);
    return result;
  }

  public async awardSocialSharing(card: ICard): Promise<void> {
    const sharedKey = `${gcBackend.gid}.${this._state.sid}.card.${card.id}.shared`;
    const result = await gcBackend.redis.hget(sharedKey, this._user.uid);

    if (!result) {
      await this.addPoints(this._config.points.socialShare, { type: PointsType.SOCIAL_SHARE });
      await gcBackend.redis.hset(sharedKey, this._user.uid, 1);
    }
  }

  public awardPoints(amount: number, leaderboards: string[]): Promise<IGCLeader[]> {
    if (this._multipleSessionsDetected) {
      return;
    }

    return gcBackend.leaderboards.add(amount, leaderboards);
  }

  public async getGames(): Promise<IGame[]> {
    let games: IGame[] = this._cache.get('games');

    if (!games) {
      games = [];

      const result = await gcBackend.firestore.global.collection(`public/clients/${gcBackend.cid}/games`).get();

      result.forEach((doc) => {
        const game: IGame = doc.data() as IGame;

        if (!game.enabled || game.xeoDisabled) {
          return;
        }

        games.push(game);
      });
      this._cache.set('games', games);
    }

    return games;
  }

  public writeAction(cardId: number, type: string, payload?: any): Promise<void> {
    return Promise.resolve();
    // This is disabled until we need to start capturing this data and can clear it out of the cache
    // const data: IActionData = {
    //   uid: gcBackend.auth.uid,
    //   sid: this._state?.sid ?? 'overall',
    //   cardId,
    //   type,
    // };
    // // Only add payload if it exists
    // if (payload) {
    //   data.payload = payload;
    // }
    // // Calculate the second this is associated with
    // const time = Math.trunc((await this.time()) / 1000);
    // const base = `${gcBackend.gid}.time-series`;
    // const json = JSON.stringify(data);
    // await gcBackend.redis.zadd(`${base}.overall`, time, json);
    // await gcBackend.redis.zadd(`${base}.${data.sid}.${data.cardId}`, time, json);
    // // Only write this one if there is an actual sid in the state
    // if (data.sid !== 'overall') {
    //   await gcBackend.redis.zadd(`${base}.${data.sid}`, time, json);
    // }
  }

  public async getSessionPosition(): Promise<number> {
    if (isEmptyString(this._state?.sid)) {
      return 0;
    }

    const position = await gcBackend.redis.get(
      `${gcBackend.gid}.session-position.${this._state.sid}.${gcBackend.auth.uid}`,
    );

    if (!position) {
      return 0;
    }

    return parseInt(position);
  }

  public async updateSessionPosition(value: number): Promise<void> {
    await gcBackend.redis.set(`${gcBackend.gid}.session-position.${this._state.sid}.${gcBackend.auth.uid}`, value);
  }

  public async isSessionPaused(): Promise<boolean> {
    const result = await gcBackend.redis.get(
      `${gcBackend.gid}.session-paused.${this._state.sid}.${gcBackend.auth.uid}`,
    );
    return parseInt(result) === 1;
  }

  public toggleSessionPlayback(playing: boolean): Promise<void> {
    return gcBackend.redis.set(
      `${gcBackend.gid}.session-paused.${this._state.sid}.${gcBackend.auth.uid}`,
      playing ? 0 : 1,
    );
  }

  public async getSessionPlaybackStatus(): Promise<ISessionPlaybackStatus> {
    const [paused, position] = (await gcBackend.redis.batch(
      ['get', `${gcBackend.gid}.session-paused.${this._state.sid}.${gcBackend.auth.uid}`],
      ['get', `${gcBackend.gid}.session-position.${this._state.sid}.${gcBackend.auth.uid}`],
    )) as any[];

    return {
      paused: parseInt(paused) === 1,
      position: position ? parseInt(position) : 0,
    };
  }

  public isUserBanned(): Promise<boolean> {
    return gcBackend.leaderboards.isUserBanned(this._user.uid);
  }

  public startRTMPStream(id: string): Promise<void> {
    return this._wowza.start(id);
  }

  public getRTMPStreamState(id: string): Promise<string> {
    return this._wowza.state(id);
  }

  public async watchSingleUser(callback: VoidFunction): Promise<void> {
    if (!GC_PRODUCTION) {
      return;
    }

    const channel = `${gcBackend.cid}-${GAME_ID}-presence-${this._user.uid}`;

    gcBackend.pubnub.client.subscribe({
      channels: [channel],
      withPresence: true,
    });

    let id: string;

    // for mobile we allow multiple sessions for the same device
    if (isAndroid() || isIOS()) {
      id = await gcLocalStorage.getItem('xc.deviceId');

      if (isEmptyString(id)) {
        id = uuid();
        await gcLocalStorage.setItem('xc.deviceId', id);
      }
    } else {
      id = uuid();
    }

    let stateSynced: boolean;

    gcBackend.pubnub.client.addListener({
      presence: (presence) => {
        if (presence.channel !== channel || this._multipleSessionsDetected || presence.action === 'leave') {
          return;
        }

        if (presence.state?.id === id) {
          stateSynced = true;
        } else if (stateSynced && !isEmptyString(presence.state?.id) && presence.state.id !== id) {
          this._multipleSessionsDetected = true;
          callback();
        }
      },
    });

    gcBackend.pubnub.client.setState({
      channels: [channel],
      state: {
        id,
      },
    });
  }

  // This is for forcing the user's data to be set every single time they switch screens
  public async verifyLeaderboardData(): Promise<void> {
    if (
      !isEmptyString(this._user?.username) &&
      ((!isEmptyString(this._user?.phone) && !isEmptyString(this._user?.email)) || this._config.signup.anonymous)
    ) {
      const updates: any = {
        username: this._user.username,
      };

      if (this._user.phone) {
        updates.phone = this._user.phone;
      }

      if (this._user.email) {
        updates.email = this._user.email;
      }

      await this.initLeaderboard(GCLeaderboards.OVERALL, updates);

      if (!isEmptyString(this._state?.sid)) {
        await this.initLeaderboard(this._state.sid, updates);
      }
    }
  }

  private async updateLastActive(): Promise<void> {
    if (isEmptyString(this._state?.sid) || this._isPreviewMode) {
      return;
    }

    const interactionTime: number = await this.time();
    const seriesResult = await gcBackend.redis.get(
      `${gcBackend.gid}.time-series.${this._state.sid}.${gcBackend.auth.uid}`,
    );
    let timeSeries = JSON.parse(seriesResult);
    if (!Array.isArray(timeSeries)) {
      timeSeries = [];
    }
    timeSeries.push({
      loginTime: Math.max(this._loginTime, interactionTime - 30000 + 1000),
      interactionTime,
    });

    await gcBackend.redis.set(
      `${gcBackend.gid}.time-series.${this._state.sid}.${gcBackend.auth.uid}`,
      JSON.stringify(timeSeries),
    );
  }

  private async initLeaderboard(id: string, update) {
    if (this._isPreviewMode) {
      return;
    }

    return gcBackend.leaderboards.init(id, update);
  }

  public joinTeamByPin(channelId: string, pinCode: string, data: IGroupUserData): Promise<string> {
    return this._userGroups.joinTeamByPin(channelId, pinCode, data);
  }

  public get chat(): IChatService {
    return this._chat;
  }

  public async initLeaderEntry(id: string): Promise<IGCLeader> {
    if (this._isPreviewMode) {
      return;
    }

    const updates: any = {
      username: this._user.username,
    };

    if (this._user.phone) {
      updates.phone = this._user.phone;
    }

    if (this._user.email) {
      updates.email = this._user.email;
    }

    return this.initLeaderboard(id, updates);
  }
}

expose(WorkerAPIService);
