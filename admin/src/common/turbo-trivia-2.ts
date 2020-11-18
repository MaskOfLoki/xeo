import { IGCLeader } from '@gamechangerinteractive/xc-backend';
import { IPreset, ISignupField } from '../../../common/common';
import { ColorValue } from '../../../common/types/Color';

export interface ITriviaProject extends IPreset {
  id: string;
  slots: ISlot[];
}

export interface IGameData {
  questions: IQuestion[];
  titleTimer: number;
  questionTimer: number;
  gamePoints?: number;
  isRoundBased?: boolean;
}

export interface ISlot {
  id: string;
  name: string;
  data: IGameData;
}

export interface IQuestion {
  id: string;
  text: string;
  file: IFile;
  answers: IAnswer[];
  type?: QuestionType;
}

export enum QuestionType {
  QUESTION_MULTI,
  MEDIA,
}

export interface IFile {
  url: string;
  duration?: number;
}

export interface IAnswer {
  id: string;
  text: string;
  image?: string;
  correct: boolean;
}

export enum PercentageMode {
  REAL = 'real',
  FAKE = 'fake',
}

export interface ITurboTriviaState {
  sid?: string;
  game?: IGameData;
  isFreePlay?: boolean;
  isAutoRun?: boolean;
  startTime?: number;
  questionIndex?: number;
  showResult?: boolean;
  timerTitleStarted?: number;
  showQuestion?: boolean;
  questionStartTime?: number;
  showCorrectAnswer?: boolean;
  showQuestionIntro?: boolean;
  percentage?: number[];
  percentageMode?: PercentageMode;
  leaderboard?: IGCLeader[];
  isAwarded?: boolean;
  revealCountDown?: number;
  intermissionCountDown?: number;
}

export interface ITurboTriviaConfig {
  home?: {
    colors?: {
      primaryTeam?: ColorValue;
      secondaryTeam?: ColorValue;
      background?: ColorValue;
      bottomBackground?: ColorValue;
      primaryText?: ColorValue;
      secondaryText?: ColorValue;
      tertiaryText?: ColorValue;
      percentText?: ColorValue;
    };
    images?: {
      team?: string;
      sponsor?: string;
    };
    font?: string;
    customFont?: string;
  };
  mobile?: {
    introText?: string;
    welcomeText?: string;
    background?: string;
  };
  game?: {
    gameTitle?: string;
    postGameMessage?: string;
    winningMessage?: string;
    losingMessage?: string;
    defaultUserNamePrefix?: string;
    termsUrl?: string;
    privacyUrl?: string;
  };
  mainboard?: {
    introText?: string;
    welcomeText?: string;
    background?: string;
  };
  desktop?: {
    introText?: string;
    welcomeText?: string;
    background?: string;
  };
  misc?: {
    rawCountdownTimer?: boolean;
    fixedLengthNumbers?: boolean;
  };
  signup?: {
    fields?: ISignupField[];
    anonymous?: boolean;
  };
  feature?: {
    frontGate?: boolean;
    multipleLeaderboards?: boolean;
    automatedPlaythrough?: boolean;
    enabledReportGeneration?: boolean;
    mlbClient?: boolean;
    disabledPrivacy?: boolean;
    disabledTerms?: boolean;
    usernameDialogPopUp?: boolean;
    adminEveryCoupons?: boolean;
    enableAudio?: boolean;
    googleAnalytics?: boolean;
  };
  optin?: {
    enabled?: boolean;
    message?: string;
    defaultChecked?: boolean;
  };
}

export const DEFAULT_REVEAL_COUNTDOWN = 5;
export const DEFAULT_INTERMISSION_COUNTDOWN = 5;
