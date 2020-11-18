import {
  CardStatus,
  CardStopMode,
  CardType,
  IAction,
  ICard,
  IConfig,
  IImagePollCard,
  IParticipation,
  IState,
  IUser,
  MobilePreviewMode,
  ChannelType,
  ITimeline,
  IMarketingMessage,
  IUserGroup,
  IFriendsGroup,
  IUserGroupMember,
  IGroupUserData,
  ITeamCodeRequirement,
  ITeamGroup,
} from '../../../../common/common';
import { IWorkerAPIService } from './api/IWorkerAPIService';
import { isEmptyString, randInt, uuid } from '@gamechangerinteractive/xc-backend/utils';
import { IGCLeader } from '@gamechangerinteractive/xc-backend/types/IGCLeader';
import { route } from 'mithril';
import { loading } from '../../../../common/loading';
import { IGCAwardedCoupon } from '@gamechangerinteractive/xc-backend/types/IGCAwardedCoupon';
import { getQueryParam } from '../../../../common/utils/query';
import { ISessionPlaybackStatus } from '../utils';
import { IXCChatMessage } from '../../../../common/types/IXCChatMessage';
import deepEqual from 'fast-deep-equal';
import { IUserGroupsService } from './api/user-groups/IUserGroupsService';
import { IChatService } from './api/chat/IChatService';

const ROUTES = {
  [MobilePreviewMode.HOME]: '/home',
  [MobilePreviewMode.PRIZES]: '/prizes',
  [MobilePreviewMode.RANK]: '/rank',
  [MobilePreviewMode.PROFILE]: '/profile',
  [MobilePreviewMode.CHAT]: '/chat',
};

class PreviewService implements IWorkerAPIService {
  private _stateCallback: (value: IState) => void;
  private _configCallback: (value: IConfig) => void;
  private _previewMode: MobilePreviewMode;
  private _id: number;
  private _sessionPosition = 0;
  private _sessionPaused = true;
  private _channel: string;
  private _state: IState = {};
  private _marketingMessages: IMarketingMessage[] = [];

  public userGroups: IUserGroupsService = {
    getTeam(): Promise<ITeamGroup> {
      return Promise.resolve(undefined);
    },
    getMyGroups(): Promise<IUserGroup[]> {
      return Promise.resolve([]);
    },
    getFriendsGroup(): Promise<IFriendsGroup> {
      return Promise.resolve(undefined);
    },
    getFriendsGroupCode(): Promise<string> {
      return Promise.resolve(undefined);
    },
    joinFriendsGroup(code: string, username: string): Promise<void> {
      return Promise.resolve();
    },
    deleteGroup(groupId: string): Promise<void> {
      return Promise.resolve();
    },
    removeGroupMember(groupId: string, uid: string): Promise<void> {
      return Promise.resolve();
    },
    restoreGroupMember(groupId: string, uid: string): Promise<void> {
      return Promise.resolve();
    },
    getGroupMembers(groupId: string): Promise<IUserGroupMember[]> {
      return Promise.resolve([]);
    },
    joinTeamByPin(channelId: string, pinCode: string, data: IGroupUserData): Promise<string> {
      return Promise.resolve('');
    },
    isTeamCodeRequired(channelId: string): Promise<ITeamCodeRequirement> {
      return Promise.resolve({ mandatory: false, enabled: false });
    },
    leaveFriendsGroup(): Promise<void> {
      return Promise.resolve();
    },
  };

  public chat: IChatService = {
    getMessageHistory(namespace?: string): Promise<IXCChatMessage[]> {
      return Promise.resolve([]);
    },
    sendMessage(message: string, namespace?: string): Promise<void> {
      return Promise.resolve();
    },
    watch(callback: (value: IXCChatMessage) => void, namespace?: string): Promise<VoidFunction> {
      return Promise.resolve(() => {
        //
      });
    },
  };

  public async isLoggedIn(): Promise<IUser> {
    requestAnimationFrame(this.initPreviewRoute.bind(this));

    return Promise.resolve({
      uid: 'preview',
      username: 'preview',
      email: 'preview',
      phone: 'preview',
      avatar: 0,
    });
  }

  private initPreviewRoute() {
    const previewRoute = ROUTES[this._previewMode];

    if (isEmptyString(previewRoute)) {
      return;
    }

    route.set(previewRoute);

    if (this._previewMode !== MobilePreviewMode.CARD) {
      this._state = {
        sid: uuid(),
        channel: {
          id: this._channel,
          name: 'Preview Event',
          cards: [],
          type: ChannelType.MANUAL,
        },
        marketingMessages: this._marketingMessages,
      };

      this._stateCallback(this._state);
    }
  }

  public markFrontgate(): void {
    return;
  }

  public async init(
    cid: string,
    previewMode: MobilePreviewMode,
    channel: string,
    stateCallback: (value: IState) => void,
    configCallback: (value: IConfig) => void,
    pointsCallback: (value: IGCLeader) => void,
    couponCallback: (value: IGCAwardedCoupon) => void,
  ) {
    loading.disable();
    this._previewMode = previewMode;
    this._id = parseInt(getQueryParam('previewId'));
    this._channel = channel;

    this._stateCallback = stateCallback;
    this._configCallback = configCallback;
    window.parent.postMessage(`previewReady${this._id}`, '*');
    window.addEventListener('message', this.messageHandler.bind(this));
    pointsCallback({
      points: 1000,
      uid: 'preview',
      position: 12,
      username: 'preview',
    });

    return Promise.resolve();
  }

  public submitChatReaction(messageId: string, action: string): Promise<any> {
    return Promise.resolve();
  }

  public submitChatMessage(message: string): Promise<void> {
    return Promise.resolve();
  }

  public async onChatReaction(callback: any): Promise<void> {
    return Promise.resolve();
  }

  public async getMessageReactions(): Promise<any> {
    return Promise.resolve(undefined);
  }

  public async getMessageHistory(): Promise<any> {
    return Promise.resolve();
  }

  public submitThumbsCardAnswer(card: ICard, up: boolean): Promise<void> {
    return Promise.resolve();
  }

  public getThumbsCardAnswer(card: ICard): Promise<boolean> {
    return Promise.resolve(false);
  }

  public time(): Promise<number> {
    return Promise.resolve(Date.now());
  }

  public getParticipation(card: ICard): Promise<IParticipation> {
    return Promise.resolve({
      id: card.id,
      total: 10000,
      claps: 10000,
      up: 8500,
    });
  }

  public async verifyLeaderboardData() {
    return Promise.resolve();
  }

  private messageHandler(e: MessageEvent) {
    const data = e.data;

    if (isEmptyString(data.type) || data.id !== this._id) {
      return;
    }

    switch (data.type) {
      case 'updateCard': {
        if (data.card) {
          this.cardUpdate(data.card);
        }
        break;
      }
      case 'updateConfig': {
        if (data.config) {
          this.configUpdate(data.config);
        }
        break;
      }
      case 'seekTimeline': {
        if (data.timeline) {
          this._sessionPosition = data.position ?? 0;
          this.timelineUpdate(data.timeline);
        }
        break;
      }
      case 'playTimeline': {
        if (data.timeline) {
          this._sessionPaused = false;
          this.timelineUpdate(data.timeline);
        }
        break;
      }
      case 'pauseTimeline': {
        if (data.timeline) {
          this._sessionPaused = true;
          this._sessionPosition = data.position;
          this.timelineUpdate(data.timeline);
        }
        break;
      }
      case 'updateMarketingMessages': {
        if (!deepEqual(this._marketingMessages, data.marketingMessages)) {
          this._marketingMessages = data.marketingMessages;
          this._state.marketingMessages = this._marketingMessages;
          this._stateCallback(this._state);
        }
        break;
      }
      default: {
        console.warn('PreviewService.messageHandler: unknown type', data.type);
        break;
      }
    }
  }

  private cardUpdate(card: ICard) {
    if (card.type === CardType.POLL_IMAGE) {
      const c: IImagePollCard = card as IImagePollCard;
      c.answers = c.answers.filter((answer) => !isEmptyString(answer.url));
    }

    card.stopMode = CardStopMode.MANUAL;
    card.status = CardStatus.LIVE;
    this._stateCallback(
      (this._state = {
        sid: 'preview',
        channel: {
          id: this._channel,
          name: 'preview',
          cards: [card],
          type: ChannelType.MANUAL,
        },
        marketingMessages: this._marketingMessages,
      }),
    );

    //console.log('home card update');
    //route.set('/home');
  }

  private configUpdate(config: IConfig) {
    this._configCallback(config);
    requestAnimationFrame(this.initPreviewRoute.bind(this));
  }

  private timelineUpdate(timeline: ITimeline) {
    this._stateCallback(
      (this._state = {
        sid: uuid(),
        channel: {
          id: this._channel,
          name: 'Preview Channel',
          cards: timeline.cards,
          timeline,
          type: ChannelType.TIMELINE,
        },
        marketingMessages: this._marketingMessages,
      }),
    );
  }

  public submitCardView(card: ICard): Promise<void> {
    return Promise.resolve(undefined);
  }

  public getApplauseCardClaps(card: ICard): Promise<number> {
    return Promise.resolve(0);
  }

  public submitApplauseCardClap(card: ICard, value: number): Promise<number> {
    return Promise.resolve(0);
  }

  public getSliderCardValue(card: ICard): Promise<number> {
    return Promise.resolve(0);
  }

  public submitSliderCardValue(card: ICard, value: number, oldValue: number): Promise<void> {
    return Promise.resolve();
  }

  public submitPollCardAnswer(card: ICard, answer: string): Promise<void> {
    return Promise.resolve();
  }

  public getPollCardAnswer(card: ICard): Promise<string> {
    return Promise.resolve('');
  }

  public getRandomActions(id: string, count: number): Promise<IAction[]> {
    return Promise.resolve([]);
  }

  public verifyPhone(phone: string): Promise<void> {
    return Promise.resolve();
  }

  public verifyPhoneCode(code: string): Promise<IUser> {
    return Promise.resolve(undefined);
  }

  public updateUser(update: Partial<IUser>): Promise<void> {
    return Promise.resolve();
  }

  public isUsernameAvailable(value: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  public getOnlineUsers(): Promise<number> {
    return Promise.resolve(10000);
  }

  public getLeaders(leaderboard: string, limit = 10): Promise<IGCLeader[]> {
    const scores = Array.from({ length: limit }).map(() => randInt(10000, 100000));
    scores.sort((p1, p2) => p2 - p1);
    const result: IGCLeader[] = scores.map((points, position) => {
      return {
        uid: position.toString(),
        username: `Username ${position + 1}`,
        points,
        position,
      };
    });
    return Promise.resolve(result);
  }

  public getLeaderEntry(leaderboard: string): Promise<IGCLeader> {
    return Promise.resolve({
      points: 1000,
      uid: 'preview',
      position: 12,
      username: 'preview',
    });
  }

  public initLeaderEntry(leaderboard: string): Promise<IGCLeader> {
    return Promise.resolve({
      points: 1000,
      uid: 'preview',
      position: 12,
      username: 'preview',
    });
  }

  public submitSounderCardValue(
    card: ICard,
    value: { [index: number]: number },
    isFirstSubmit: boolean,
  ): Promise<void> {
    return Promise.resolve();
  }

  public getAwardedCoupons(): Promise<IGCAwardedCoupon[]> {
    return Promise.resolve([]);
  }

  public awardSocialSharing(card: ICard): Promise<void> {
    return Promise.resolve();
  }

  public awardPoints() {
    return Promise.resolve([]);
  }

  public getGames() {
    return Promise.resolve([]);
  }

  public writeAction(cardId: number, type: string, payload?: any): Promise<void> {
    return Promise.resolve();
  }

  public getSessionPosition(): Promise<number> {
    return Promise.resolve(this._sessionPosition);
  }

  public updateSessionPosition(value: number) {
    return Promise.resolve();
  }

  public isSessionPaused(): Promise<boolean> {
    return Promise.resolve(this._sessionPaused);
  }

  public toggleSessionPlayback(value: boolean): Promise<void> {
    return Promise.resolve();
  }

  public getSessionPlaybackStatus(): Promise<ISessionPlaybackStatus> {
    return Promise.resolve({
      paused: this._sessionPaused,
      position: this._sessionPosition,
    });
  }

  public isUserBanned(): Promise<boolean> {
    return Promise.resolve(false);
  }

  public submitIntegratedGamePoints(value: number): Promise<void> {
    return Promise.resolve();
  }

  public startRTMPStream(id: string): Promise<void> {
    return Promise.resolve();
  }

  public getRTMPStreamState(id: string): Promise<string> {
    return Promise.resolve('started');
  }

  public watchSingleUser(callback: VoidFunction): Promise<void> {
    return Promise.resolve();
  }

  public loginAnonymously(): Promise<IUser> {
    return Promise.resolve({
      uid: 'preview',
      username: 'preview',
      email: 'preview',
      phone: 'preview',
      avatar: 0,
    });
  }
}

export const preview: PreviewService = new PreviewService();
