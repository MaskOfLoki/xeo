import { CardType } from '../../../../common/common';
import { EditThumbs } from '../components/popups/edit-card/thumbs';
import { EditApplause } from '../components/popups/edit-card/applause';
import { EditSlider } from '../components/popups/edit-card/slider';
import { EditPoll } from '../components/popups/edit-card/poll';
import { EditPollImage } from '../components/popups/edit-card/poll-image';
import { EditTrivia } from '../components/popups/edit-card/trivia';
import { EditTriviaImage } from '../components/popups/edit-card/trivia-image';
import { EditImage } from '../components/popups/edit-card/image';
import { EditVideo } from '../components/popups/edit-card/video';
import { EditSounder } from '../components/popups/edit-card/sounder';
import { EditHatShuffle } from '../components/popups/edit-card/hat-shuffle';
import { EditPopAShot } from '../components/popups/edit-card/pop-a-shot';
import { EditSkeeball } from '../components/popups/edit-card/skeeball';
import { EditTugOfWar } from '../components/popups/edit-card/tug-of-war';
import { EditFanFilterCam } from '../components/popups/edit-card/fan-filter-cam';
import { EditTarget } from '../components/popups/edit-card/target';
import { EditQBToss } from '../components/popups/edit-card/qb-toss';
import { EditBrowser } from '../components/popups/edit-card/browser';
import { EditTurboTrivia } from '../components/popups/edit-card/turbo-trivia';

export interface ICardTypeData {
  icon: string;
  title: string;
  type: CardType;
  subtitle?: string;
  editComponent?: any;
  disableCensus?: boolean;
}

const data = {
  [CardType.REACTION_THUMBS]: {
    icon: 'thumb-up.svg',
    title: 'REACTION',
    type: CardType.REACTION_THUMBS,
    subtitle: 'THUMBS',
    editComponent: EditThumbs,
  },
  [CardType.REACTION_APPLAUSE]: {
    icon: 'applause.svg',
    title: 'REACTION',
    type: CardType.REACTION_APPLAUSE,
    subtitle: 'APPLAUSE',
    editComponent: EditApplause,
  },
  [CardType.REACTION_SLIDER]: {
    icon: 'smiley.svg',
    title: 'REACTION',
    type: CardType.REACTION_SLIDER,
    subtitle: 'SLIDER',
    editComponent: EditSlider,
  },
  [CardType.POLL]: {
    icon: 'poll.svg',
    title: 'POLL',
    type: CardType.POLL,
    editComponent: EditPoll,
  },
  [CardType.POLL_IMAGE]: {
    icon: 'poll.svg',
    title: 'POLL',
    type: CardType.POLL_IMAGE,
    editComponent: EditPollImage,
  },
  [CardType.TRIVIA]: {
    icon: 'trivia.svg',
    title: 'TRIVIA',
    type: CardType.TRIVIA,
    editComponent: EditTrivia,
  },
  [CardType.TRIVIA_IMAGE]: {
    icon: 'trivia.svg',
    title: 'TRIVIA',
    type: CardType.TRIVIA_IMAGE,
    editComponent: EditTriviaImage,
  },
  [CardType.IMAGE]: {
    icon: 'image.svg',
    title: 'IMAGE',
    type: CardType.IMAGE,
    editComponent: EditImage,
  },
  [CardType.VIDEO]: {
    icon: 'video.svg',
    title: 'VIDEO',
    type: CardType.VIDEO,
    editComponent: EditVideo,
  },
  [CardType.SOUNDER]: {
    icon: 'sounder.svg',
    title: 'REACTION',
    type: CardType.SOUNDER,
    subtitle: 'SOUNDOFF',
    editComponent: EditSounder,
    disableCensus: true,
  },
  [CardType.QB_TOSS]: {
    icon: 'arcade_game_icon.svg',
    title: 'QB TOSS',
    type: CardType.QB_TOSS,
    editComponent: EditQBToss, // TODO: Swap this with the real one.
  },
  [CardType.HAT_SHUFFLE]: {
    icon: 'arcade_game_icon.svg',
    title: 'HAT SHUFFLE',
    type: CardType.HAT_SHUFFLE,
    editComponent: EditHatShuffle,
  },
  [CardType.POP_A_SHOT]: {
    icon: 'arcade_game_icon.svg',
    title: 'POP A SHOT',
    type: CardType.POP_A_SHOT,
    editComponent: EditPopAShot,
  },
  [CardType.SKEEBALL]: {
    icon: 'arcade_game_icon.svg',
    title: 'SKEEBALL',
    type: CardType.SKEEBALL,
    editComponent: EditSkeeball,
  },
  [CardType.TURBO_TRIVIA_2]: {
    icon: 'arcade_game_icon.svg',
    title: 'TURBO TRIVIA 2',
    type: CardType.TURBO_TRIVIA_2,
    editComponent: EditTurboTrivia,
  },
  [CardType.TUG_OF_WAR]: {
    icon: 'arcade_game_icon.svg',
    title: 'TUG OF WAR',
    type: CardType.TUG_OF_WAR,
    editComponent: EditTugOfWar,
  },
  [CardType.FAN_FILTER_CAM]: {
    icon: 'arcade_game_icon.svg',
    title: 'FAN FILTER CAM',
    type: CardType.FAN_FILTER_CAM,
    editComponent: EditFanFilterCam,
  },
  [CardType.TARGET]: {
    icon: 'target.svg',
    title: 'TARGET',
    type: CardType.TARGET,
    editComponent: EditTarget,
  },
  [CardType.BROWSER]: {
    icon: 'web.svg',
    title: 'WEB',
    type: CardType.BROWSER,
    editComponent: EditBrowser,
  },
};

export class CardTypeDataFactory {
  public static get(type: CardType): ICardTypeData {
    return data[type];
  }

  public static all(): ICardTypeData[] {
    return Object.values(data);
  }
}
