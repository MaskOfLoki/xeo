import { AwardStatus } from '@gamechangerinteractive/xc-backend/types/AwardStatus';
import { ColorValue } from './types/Color';
import { IGCCoupon, IGCLeader } from '@gamechangerinteractive/xc-backend';
import { IGCUser } from '@gamechangerinteractive/xc-backend';
import { cloneObject, deepMerge } from '@gamechangerinteractive/xc-backend/utils';
import { GradientDirection, GradientType, IGradientData } from './types/Gradients';
import { IGCAwardedCoupon } from '@gamechangerinteractive/xc-backend/types/IGCAwardedCoupon';

export const GAME_ID = 'xeo';

export interface IState {
  /**
   * Session identifier
   */
  sid?: string;
  channel?: IChannel;
  startTime?: number;
  pausedTime?: number;
  stopTime?: number;
  marketingMessages?: IMarketingMessage[];
  showMarketingMessages?: boolean;
}

export interface IMainboardState extends IState {
  layout?: MainboardLayout;
  zone?: MainboardZone;
  fullscreen_zone?: MainboardZone;
  sideslab_zone?: MainboardZone;
  lower_third_zone?: MainboardZone;
  display?: MainboardDisplay;
  customCard?: ICard;
  backgroundVideoStatus?: MainboardBackgroundVideoStatus;
  /**
   * Leaderboard that was pushed from admin site.
   * Once pushed, mainboard will display only pushed values and dont check server on refresh
   */
  overriddenLeaderboard?: IGCLeader[];
  customLeaderboard?: boolean;
}

export enum MainboardBackgroundVideoStatus {
  STOPPED,
  PLAYING,
  PAUSED,
}

export enum MainboardLayout {
  FULLSCREEN = 'fullscreen',
  SIDESLAB = 'sideslab',
  LOWER_THIRD = 'lower_third',
}

export enum MainboardZone {
  FULLSCREEN_ZONE5 = 'fullscreen_zone5',
  FULLSCREEN_ZONE4 = 'fullscreen_zone4',
  SIDESLAB_ZONE3 = 'sideslab_zone3',
  SIDESLAB_ZONE2 = 'sideslab_zone2',
  LOWER_THIRD_ZONE3 = 'lower_third_zone3',
  LOWER_THIRD_ZONE2 = 'lower_third_zone2',
  LEADERBOARD = 'leaderboard',
}

export enum MainboardDisplay {
  CURRENT_CARD,
  CUSTOM_CARD,
  LEADERBOARD,
  ACTIONBOARD,
}

export enum MainboardPreviewMode {
  EVENT,
  SETTING,
}

export enum MainboardLayoutItemType {
  LIVE_RESPONSE = 'live_response',
  IMAGE_VIDEO = 'image_video',
  IMAGE = 'image',
  VIDEO = 'video',
  CARD_CONTENT = 'card_content',
  ANALYTICS = 'analytics',
  CARD_RESPONSE = 'card_response',
  CARD_RESPONSE_TREND = 'card_response_trend',
  LEADERBOARD = 'leaderboard',
}

export interface IMainboardLayoutItem {
  prefix: string;
  left: number;
  top: number;
  width: number;
  height: number;
  types: Array<MainboardLayoutItemType>;
  defaultType: MainboardLayoutItemType;
}

export enum IntegratedGame {
  PGP = 'predictive-platform',
  BINGO = 'bingo',
  SKEEBALL = 'skeeball',
  HAT_SHUFFLE = 'hat-shuffle',
  TUG_OF_WAR = 'tug-of-war',
  FAN_FILTER_CAM = 'fan-filter-cam',
  QB_TOSS = 'qb-toss',
  TURBO_TRIVIA_2 = 'turbo-trivia-2',
  POP_A_SHOT = 'pop-a-shot',
}

export interface IPreset {
  id: string;
  name: string;
  type: string;
  [index: string]: any;
}

export interface IProject extends IPreset {
  id: string;
  channels: IChannel[];
}

export interface IChannel {
  id: string;
  name: string;
  cardSets?: ICardSet[];
  cards: ICard[];
  type: ChannelType;
  timeline?: ITimeline;
  online?: boolean;
  synced?: boolean;
  deleted?: number;
  isPreview?: boolean;
  showUserCount?: boolean;
  version?: string;
  media?: string | IRTMPStream;
  showChatroom?: boolean;
  showMedia?: boolean;
}

export enum ChannelType {
  MANUAL,
  TIMELINE,
}

export interface ICardSet {
  id: number;
  name: string;
}

export interface IIconSet {
  id: string;
  name: string;
  icons?: string[];
}

export interface ICouponSet {
  id: string;
  name: string;
}

export interface IAwardedCoupon extends IGCAwardedCoupon {
  redemptionCode?: string;
}

export interface ICard {
  id: number;
  name: string;
  type: CardType;
  cardSetId?: number;
  startTime?: number;
  status?: CardStatus;
  stopMode?: CardStopMode;
  stopTimer?: number;
  stopCensus?: number;
  points?: number;
  colors?: {
    background?: ColorValue;
    text?: string;
    divider?: ColorValue;
  };
  images?: {
    backgroundImage?: string;
    background?: string;
    divider?: string;
    portrait?: string;
  };
  marketingMessage?: {
    type?: 'text' | 'image';
    image?: string;
    message?: string;
    url?: string;
  };
  transition?: CardTransition;
  metadata?: {
    version?: string;
    [index: string]: any;
  };
}

export interface ITargetCard extends ICard {
  targetType: TargetType;
  target: IMultipleChoiceSignupField | ICard | ITeamConfig;
  entries: ITargetEntry[];
}

export enum TargetType {
  SIGNUP,
  CARD,
  TEAM,
}

export interface ITargetEntry {
  card: ICard;
  relation: string;
}

export interface ITimeline {
  cards?: ITimelineCard[];
  duration?: number;
}

export interface ITimelineCard extends ICard {
  startTimer?: number;
}

export enum CardTransition {
  NONE,
  FADE,
  SLIDE,
}

export interface IThumbsCard extends ICard {
  header: string;
  message: string;
  images?: {
    background?: string;
    up?: string;
    down?: string;
  };
}

export interface IApplauseCard extends ICard {
  header: string;
  message: string;
  colors?: {
    background?: string;
    text?: string;
    clapIcon?: string;
    clapBackground?: ColorValue;
  };
  images?: {
    background?: string;
    clap?: string;
  };
}

export interface ISounderCard extends ICard {
  message: string;
  sounds: ISound[];
  muteMobile?: boolean;
  delay?: number;
  colors?: {
    background?: string;
    text?: string;
    header?: string;
    button?: string;
    icon?: string;
  };
}

export interface ISliderCard extends ICard {
  labels: string[];
}

export interface ISound {
  url: string;
  name: string;
  image: string;
}

export interface ITextPollCard extends ICard {
  question: string;
  answers: string[];
  pollType: PollType;
  colors?: {
    background?: ColorValue;
    text?: string;
    backgroundQuestion?: ColorValue;
    backgroundAnswer?: ColorValue;
  };
}

export interface IImagePollCard extends ICard {
  question: IImage;
  answers: IImage[];
  colors?: {
    background?: string;
    text?: string;
    backgroundQuestion?: string;
  };
}

export interface IImage {
  url: string;
  label?: string;
}

export interface ITriviaCard extends ICard {
  question: string;
  answers: ITriviaAnswer[];
  colors?: {
    background?: string;
    text?: string;
    backgroundQuestion?: string;
    backgroundAnswer?: string;
  };
}

export interface IImageTriviaCard extends ICard {
  question: IImage;
  answers: IImageTriviaAnswer[];
  colors?: {
    background?: string;
    text?: string;
    backgroundQuestion?: string;
  };
}

export interface ITriviaAnswer {
  value: string;
  correct?: boolean;
}

export interface IImageTriviaAnswer extends IImage {
  correct?: boolean;
}

export interface IImageCard extends ICard {
  imagePortrait: string;
  imageOnly?: boolean;
  imageLandscape?: string;
  clickable?: boolean;
  url: string;
  socialShare?: boolean;
  message: string;
  socialMessage?: string;
}

export interface IIntegrationCard extends ICard {
  game: IntegratedGame;
  state?: any;
}

export interface IPGPCard extends IIntegrationCard {
  text: { [index: string]: string };
  colors: {
    primary?: ColorValue;
    secondary?: ColorValue;
    background?: ColorValue;
    text?: string;
    text2?: string;
    text3?: string;
    text4?: string;
    text5?: string;
    text6?: string;
    pending?: string;
    pushed?: string;
    incorrect?: string;
    correct?: string;
  };
}

export interface ISkeeballCard extends IIntegrationCard {
  timers: {
    splashScreen?: number;
    gameStart?: number;
    game?: number;
  };
  colors: {
    primary?: ColorValue;
    secondary?: ColorValue;
    text?: string;
    ball?: ColorValue;
  };
  images: {
    icon?: string;
    logo?: string;
    backgroundImage?: string;
    ballLogo?: string;
    sponsorLogo?: string;
    // This is a useless value, but needed to facilitate interface compatibility
    background?: string;
  };
}

export interface IPopAShotCard extends IIntegrationCard {
  timers: {
    splashScreen?: number;
    gameStart?: number;
    game?: number;
  };
  colors: {
    primary?: ColorValue;
    secondary?: ColorValue;
    text?: string;
  };
  images: {
    icon?: string;
    teamLogo?: string;
    sponsorLogo?: string;
    // This is a useless value, but needed to facilitate interface compatibility
    background?: string;
  };
}

export enum TurboTriviaPlayMode {
  MANUAL,
  FREE_PLAY,
  AUTO_DRIVE,
}

export interface ITurboTriviaCard extends IIntegrationCard {
  timers: {
    revealTimer?: number;
    intermissionTimer?: number;
  };
  slot: string;
  mode: TurboTriviaPlayMode;
}

export interface IQBTossCard extends IIntegrationCard {
  timers: {
    splashScreen?: number;
    gameStart?: number;
    game?: number;
  };
  colors: {
    primary?: ColorValue;
    secondary?: ColorValue;
    text?: string;
    ball?: ColorValue;
  };
  images: {
    icon?: string;
    logo?: string;
    backgroundImage?: string;
    ballLogo?: string;
    sponsorLogo?: string;
    // This is a useless value, but needed to facilitate interface compatibility
    background?: string;
  };
}

export interface IHatShuffleCard extends IIntegrationCard {
  timers: {
    splashScreen?: number;
    gameStart?: number;
    reveal?: number;
  };
  colors: {
    primary?: ColorValue;
    secondary?: ColorValue;
    text?: string;
  };
  images: {
    icon?: string;
    backgroundImage?: string;
    ballLogo?: string;
    sponsorLogo?: string;
    // This is a useless value, but needed to facilitate interface compatibility
    background?: string;
  };
}

export interface ITugOfWarCard extends IIntegrationCard {
  timers: {
    splashScreen?: number;
    gameStart?: number;
  };
  colors: {
    primary?: ColorValue;
    secondary?: ColorValue;
    text?: string;
  };
  images: {
    icon?: string;
    backgroundImage?: string;
    sponsorLogo?: string;
    // This is a useless value, but needed to facilitate interface compatibility
    background?: string;
  };
}

export interface IFanFilterCamCard extends IIntegrationCard {
  images: {
    mainboard?: string;
    sponsorPortrait?: string;
    sponsorLandscape?: string;
    // This is a useless value, but needed to facilitate interface compatibility
    background?: string;
  };
  filters: {
    emoji: boolean;
    animal: boolean;
    custom: {
      [index: string]: {
        url: string;
        title: string;
      };
    };
  };
}

export interface IVideoCard extends ICard {
  message: string;
  video: string | IRTMPStream;
  autoStart?: boolean;
  loop?: boolean;
  socialShare?: boolean;
  hideControls?: boolean;
}

export interface IImageObject {
  url: string;
  name?: string;
  size?: string;
}

export const EMPTY_IMAGE: IImageObject = {
  url: '',
  name: '',
  size: '',
};

export interface IBrowserCard extends ICard {
  headline?: string;
  subheadline?: string;
  image?: IImageObject;
  imageOnly?: boolean;
  url: string;
  clickable?: boolean;
  scrollEnabled?: boolean;
}

// keep enum in sync with same enum from xeo-feed function of azure-functions project
export enum CardType {
  REACTION_THUMBS,
  REACTION_APPLAUSE,
  REACTION_SLIDER,
  IMAGE,
  VIDEO,
  POLL,
  TRIVIA,
  POLL_IMAGE,
  TRIVIA_IMAGE,
  SOUNDER,
  PGP,
  SKEEBALL,
  HAT_SHUFFLE,
  TUG_OF_WAR,
  TARGET,
  FAN_FILTER_CAM,
  TURBO_TRIVIA_2,
  QB_TOSS,
  BROWSER,
  POP_A_SHOT,
}

export enum CardTypes {
  REACTIONS,
  TRIVIA_POLLS,
  IMAGE_VIDEO,
  GAMES,
}

export enum CardStatus {
  INACTIVE,
  LIVE,
  DONE,
}

export enum CardStopMode {
  AUTO,
  MANUAL,
  CENSUS,
}

export enum PollType {
  MULTIPLE_CHOICE,
  OPEN_RESPONSE,
}

export interface IParticipation {
  id: number;
  total: number;
}

export interface IThumbsParticipation extends IParticipation {
  up: number;
  down: number;
}

export interface IApplauseParticipation extends IParticipation {
  claps: number;
}

export interface ISliderParticipation extends IParticipation {
  [index: number]: number;
}

export interface ITriviaParticipation extends IParticipation {
  answers: {
    [index: string]: number;
  };
}
export interface IPollParticipation extends IParticipation {
  answers: {
    [index: string]: number;
  };
}

export interface ISounderParticipation extends IParticipation {
  sounds: {
    [index: number]: number;
  };
}

export interface IConfig {
  program?: {
    replay?: {
      message?: string;
      logo?: string;
      background?: string;
    };
    thankyou?: {
      message?: string;
      logo?: string;
      background?: string;
    };
    mode?: string;
    unsynced?: boolean;
    isManual?: boolean;
  };
  event?: string;
  home?: {
    colors?: {
      primary?: {
        foreground?: ColorValue;
        background?: ColorValue;
      };
      secondary?: {
        foreground?: ColorValue;
        background?: ColorValue;
      };
      tertiary?: {
        foreground?: ColorValue;
        background?: ColorValue;
      };
      levels?: {
        1?: ColorValue;
        2?: ColorValue;
        3?: ColorValue;
        4?: ColorValue;
      };
      correct?: {
        foreground?: ColorValue;
        background?: ColorValue;
      };
      sentiment?: {
        1?: ColorValue;
        2?: ColorValue;
        3?: ColorValue;
        4?: ColorValue;
        5?: ColorValue;
      };
      // TODO: Remove defunct colors
      header?: ColorValue;
      background?: ColorValue;
      button?: ColorValue;
      field?: ColorValue;
      footer?: ColorValue;
      text?: string;
      accent?: ColorValue;
      liveBar?: ColorValue;
      icon?: string;
    };
    images?: {
      mainLogo?: string;
      headerLogo?: string;
      background?: {
        landscape?: string;
        portrait?: string;
      };
      header?: {
        landscape?: string;
        portrait?: string;
      };
      footer?: {
        landscape?: string;
        portrait?: string;
      };
    };
    message?: string;
    noEventMsg?: string;
    font?: string;
    wait?: {
      landscape?: string;
      portrait?: string;
    };
  };
  leaderboard?: {
    colors?: {
      background?: ColorValue;
      text?: string;
      primary?: ColorValue;
      secondary?: ColorValue;
    };
    images?: {
      background?: {
        landscape?: string;
        portrait?: string;
      };
    };
  };
  points?: {
    sounder?: number;
    register?: number;
    checkin?: number;
    thumbs?: number;
    applause?: number;
    slider?: number;
    socialShare?: number;
    poll?: number;
    'enable-skeeball'?: boolean;
    'enable-hat-shuffle'?: boolean;
    'enable-predictive-platform'?: boolean;
    'enable-bingo'?: boolean;
    'enable-qb-toss'?: boolean;
    'enable-pop-a-shot'?: boolean;
  };
  signup?: {
    message?: string;
    terms?: string;
    activeIconSet?: string;
    defaultScreen?: string;
    iconSets?: IIconSet[];
    fields?: ISignupField[];
    anonymous?: boolean;
  };
  optin?: {
    enabled?: boolean;
    message?: string;
    defaultChecked?: boolean;
  };

  arcade?: {
    defaultLayout?: string;
  };

  misc?: {
    isonlyrealtime?: boolean;
    disableactionboard?: boolean;
    enableChatroom?: boolean;
    chat?: {
      enableReaction?: boolean;
      reaction1?: string;
      reaction2?: string;
      reaction3?: string;
      reaction4?: string;
      reaction5?: string;
    };
  };
  sms?: {
    defaultText: string;
  };
  email?: {
    defaultHtmlBody: string;
    defaultSubject: string;
  };
  feed?: {
    video?: string;
  };
  terms?: ITermCondition[];
  audioSplash?: {
    enabled?: boolean;
    message?: string;
    logo?: string;
    background?: string;
  };
}

export interface ITermCondition {
  name: string;
  url: string;
}

export interface IMainboardConfig extends IConfig {
  mainboard?: {
    [MainboardLayout.FULLSCREEN]?: any;
    [MainboardLayout.SIDESLAB]?: any;
    [MainboardLayout.LOWER_THIRD]?: any;
    images?: {
      [MainboardLayout.FULLSCREEN]?: string;
      [MainboardLayout.SIDESLAB]?: string;
      [MainboardLayout.LOWER_THIRD]?: string;
    };
    videos?: {
      [MainboardLayout.FULLSCREEN]?: string;
      [MainboardLayout.SIDESLAB]?: string;
      [MainboardLayout.LOWER_THIRD]?: string;
    };
    colors?: {
      background?: string;
      accent?: string;
      liveResponse?: string;
      chromaKey?: string;
    };
    showLiveResponses?: boolean;
  };
}

export interface ISignupField {
  type: SignupFieldType;
  name: string;
}

export interface IMultipleChoiceSignupField extends ISignupField {
  options: string[];
}

export enum SignupFieldType {
  STRING,
  MULTIPLE_CHOICE,
}

export const DEFAULT_CONFIG: IConfig = {
  program: {
    replay: {
      message: 'Test replay message',
    },
    thankyou: {
      message: 'Test thank you message',
    },
  },
  home: {
    colors: {
      primary: {
        foreground: '#01ECFC',
        background: '#002AD8',
      },
      secondary: {
        foreground: '#AC007D',
        background: '#5400C6',
      },
      tertiary: {
        foreground: '#000351',
        background: '#00011F',
      },
      correct: {
        foreground: '#01FCB8',
        background: '#009377',
      },
      levels: {
        1: '#FFFFFF',
        2: '#6F6F74',
        3: '#383841',
        4: '#000000',
      },
      sentiment: {
        1: '#FF4065',
        2: '#FFC567',
        3: '#FFFA74',
        4: '#89FF80',
        5: '#01FCB8',
      },
    },
    message: 'WELCOME!',
    noEventMsg: "The event hasn't started yet. Check back later!",
  },
  leaderboard: {
    colors: {
      primary: '#13132B',
      secondary: '#000122',
    },
  },
  points: {
    sounder: 1,
    register: 500,
    checkin: 500,
    thumbs: 500,
    applause: 1,
    slider: 500,
    socialShare: 500,
    poll: 500,
  },
  signup: {
    message: 'Sign up to have your voice heard',
    activeIconSet: 'default',
    fields: [],
  },
  optin: {
    message: "I'd like to opt in to receive sms messages",
    enabled: false,
  },
  misc: {
    isonlyrealtime: true,
    disableactionboard: true,
  },
  sms: {
    defaultText: '',
  },
  email: {
    defaultHtmlBody: '',
    defaultSubject: '',
  },
  audioSplash: {
    message: 'Welcome to the XEO experience. Tap to continue',
  },
};

export const DEFAULT_MAINBOARD_CONFIG: Partial<IMainboardConfig> = {
  mainboard: {
    colors: {
      background: '#000F4D',
      accent: '#0159B1',
      liveResponse: '#808080',
      chromaKey: '#FF0080',
    },
  },
};

export function fillDefaultConfig(value?: IConfig, defaultValue?): IConfig {
  if (!value) {
    value = {};
  }

  const result: IConfig = defaultValue ? cloneObject(defaultValue) : cloneObject(DEFAULT_CONFIG);
  deepMerge(result, value);

  // Default values containing Gradient data results in step duplication when
  // deep merge is called. These two steps are required to clean up after a
  // deepMerge call if gradient data is used in place of default gradient data.
  if ((value.home?.colors?.background as IGradientData)?.steps) {
    (result.home.colors.background as IGradientData).steps = (value.home.colors?.background as IGradientData).steps;
  }
  if ((value.home?.colors?.button as IGradientData)?.steps) {
    (result.home.colors.button as IGradientData).steps = (value.home.colors?.button as IGradientData).steps;
  }

  if (!Array.isArray(result.signup.fields)) {
    result.signup.fields = Array.from(result.signup.fields);
  }

  for (let i = 0; i < result.signup.fields.length; i++) {
    const field = result.signup.fields[i];

    if (typeof field === 'string') {
      result.signup.fields[i] = {
        type: SignupFieldType.STRING,
        name: field as string,
      };
    }
  }

  return result;
}

export enum MobilePreviewMode {
  EVENT,
  CARD,
  HOME,
  RANK,
  PRIZES,
  PROFILE,
  TIMELINE,
  CHAT,
}

export interface IUser extends IGCUser {
  over13?: boolean;
  avatar?: number;
  avatarUrl?: string;
  optIn?: boolean;
  additional?: {
    [index: string]: any;
  };
  [index: string]: any;
}

export interface IAction {
  cardType?: CardType;
  value: string;
  username: string;
}

export interface ILeader extends IGCLeader {
  email: string;
  phone: string;
  awardStatus: AwardStatus;
}

export interface IMarketingMessage {
  type: string;
  id: number;
  text?: string;
  image?: string;
  url?: string;
  timer: number;
}

export interface IGame {
  id: string;
  enabled: boolean;
  xeoDisabled?: boolean;
  name: string;
}

export const MARKETING_MESSAGE_MAX_LENGTH = 100;

export function isTimelineChannel(value: IChannel): boolean {
  return value?.type === ChannelType.TIMELINE;
}

export enum SUPPORTED_ARCADE_GIDS {
  'fan-filter-cam',
  'skeeball',
  'hat-shuffle',
  'qb-toss',
  'pop-a-shot',
}

export enum SUPPORTED_PREMIUM_ARCADE_GIDS {
  'predictive-platform',
  'bingo',
  'turbo-trivia-2',
}

export interface IUserId {
  id: string;
}

export interface IRTMPStream extends IPreset {
  playerId: string;
  sourceUrl: string;
  streamUrl: string;
}

export interface IWowzaService {
  startRTMPStream(id: string): Promise<void>;
  getRTMPStreamState(id: string): Promise<string>;
}

export interface ITimeService {
  time(): number;
}

export enum PointsType {
  CARD,
  GAME,
  SOCIAL_SHARE,
  SIGN_UP,
  EVENT_CHECKIN,
  TEAM,
}

export interface ICoupon extends IGCCoupon {
  couponSetId?: string;
}

export enum UserGroupType {
  FRIENDS = 'friends',
  TEAM = 'team',
}

export interface IUserGroup {
  _id?: string;
  cid: string;
  type: UserGroupType;
  totalUsers?: number;
}

export interface IFriendsGroup extends IUserGroup {
  host: {
    uid: string;
    username: string;
  };
}

export interface ITeamGroup extends IUserGroup {
  channelId: string;
  pinCode: string;
  url: string;
  name: string;
}

export interface IUserGroupMember {
  groupId: string;
  uid: string;
  username: string;
  avatar: string;
  removed: boolean;
}

/**
 * Team configuration inside the admin' channel setup
 */
export interface ITeamConfig {
  name: string;
  url: string;
  pin: string;
  id: string | null;
}

/**
 * Team play configuration inside the admin' channel setup
 */
export interface ITeamPlayConfig {
  enabled: boolean;
  mandatory: boolean;
  teams: ITeamConfig[];
}

/**
 * Returned from backend to specify if the channel has teams enabled or even mandatory.
 */
export interface ITeamCodeRequirement {
  enabled: boolean;
  mandatory: boolean;
}

/**
 * Player's attributes to be stored when joined a team
 */
export interface IGroupUserData {
  username?: string;
  avatar?: number;
}

export enum AdminDrivenEvents {
  CLEAR,
  DISPLAY_LEADERBOARD,
  RETURN_HOME,
}

export interface IAdminDrivenEvent {
  type: AdminDrivenEvents;
  data?: any;
}
