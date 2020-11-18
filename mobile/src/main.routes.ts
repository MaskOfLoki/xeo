import m, { route } from 'mithril';

import { SLIDER_VALUE_COUNT } from '../../common/constants/cards';
import { loading } from '../../common/loading';
import { SplashScreen } from './app/screens/splash';
import { preloadService } from './app/services/PreloadService';
import { range } from './app/utils';

export function initRoutes() {
  const routes = {
    '/splash': SplashScreen,
    '/audio-splash': {
      onmatch: async () => (await import('./app/screens/audio-splash')).AudioSplashScreen,
    },
    '/unsynced-end/:cardRoute': {
      onmatch: async () => (await import('./app/screens/unsynced-end')).UEndingScreen,
    },
    '/frontgate': {
      onmatch: async () => (await import('./app/screens/frontgate')).FrontGateScreen,
    },
    '/userinfo': {
      onmatch: async () => (await import('./app/screens/userinfo')).UserInfoScreen,
    },
    '/avatar-select': {
      onmatch: async () => (await import('./app/screens/main/profile/avatar-select')).AvatarSelectScreen,
    },
    '/additional-user-info': {
      onmatch: async () => (await import('./app/screens/main/profile/additional-user-info')).AdditionalUserInfoScreen,
    },
    '/chat': createMainRoute(async () => (await loading.wrap(import('./app/screens/main/chat'))).ChatScreen),
    '/rank': createMainRoute(async () => (await loading.wrap(import('./app/screens/main/rank'))).RankScreen),
    '/pgp': createMainRoute(async () => (await loading.wrap(import('./app/screens/main/pgp'))).PGPScreen),
    '/arcade': createMainRoute(async () => (await loading.wrap(import('./app/screens/main/arcade'))).ArcadeScreen),
    '/arcade/predictive-platform': createMainRoute(
      async () => (await loading.wrap(import('./app/screens/main/arcade/game/games/pgp'))).PGPGameScreen,
    ),
    '/arcade/turbo-trivia-2': createMainRoute(
      async () =>
        (await loading.wrap(import('./app/screens/main/arcade/game/games/turbo-trivia'))).TurboTriviaGameScreen,
    ),
    '/arcade/bingo': createMainRoute(
      async () => (await loading.wrap(import('./app/screens/main/arcade/game/games/bingo'))).BingoGameScreen,
    ),
    '/arcade/:gameid': createMainRoute(
      async () => (await loading.wrap(import('./app/screens/main/arcade/game'))).ArcadeGameScreen,
    ),
    '/prizes': createMainRoute(async () => (await import('./app/screens/main/prizes')).PrizesScreen),
    '/profile': createMainRoute(async () => (await import('./app/screens/main/profile')).ProfileScreen),
    '/profile/edit': createMainRoute(async () => (await import('./app/screens/main/profile/edit')).EditProfileScreen),
    '/profile/avatar-select': createMainRoute(
      async () => (await import('./app/screens/main/profile/avatar-select')).AvatarSelectScreen,
    ),
    '/profile/additional-user-info': createMainRoute(
      async () => (await import('./app/screens/main/profile/additional-user-info')).AdditionalUserInfoScreen,
    ),
    '/profile/manage-friends': createMainRoute(
      async () => (await import('./app/screens/main/profile/manage-friends')).ManageFriendsScreen,
    ),
    '/home': createHomeRoute(async () => (await import('./app/screens/main/home/welcome')).WelcomeScreen),
    '/home/card/thumbs': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-thumbs'))).CardThumbsScreen,
    ),
    '/home/card/applause': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-applause'))).CardApplauseScreen,
    ),
    '/home/card/image': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-image'))).CardImageScreen,
    ),
    '/home/card/video': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-video'))).CardVideoScreen,
    ),
    '/home/card/web': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-browser'))).CardBrowserScreen,
    ),
    '/home/card/slider': createHomeRoute(async () => {
      const module = await loading.wrap(import('./app/screens/main/home/card-slider'));
      const sliderImages = range(SLIDER_VALUE_COUNT).map((idx) => `assets/images/cards/slider/${idx}.png`);
      preloadService.loadImages(sliderImages);
      await loading.wrap(preloadService.waitForLoad());
      return module.CardSliderScreen;
    }),
    '/home/card/poll': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-poll'))).CardPollScreen,
    ),
    '/home/card/poll-image': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-poll-image'))).CardPollImageScreen,
    ),
    '/home/card/trivia': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-trivia'))).CardTriviaScreen,
    ),
    '/home/card/trivia-image': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-trivia-image'))).CardTriviaImageScreen,
    ),
    '/home/card/soundoff': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-sounder'))).CardSounderScreen,
    ),
    '/home/card/pgp': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-integration/games'))).PGPIntegrationScreen,
    ),
    '/home/card/hat-shuffle': createHomeRoute(
      async () =>
        (await loading.wrap(import('./app/screens/main/home/card-integration/games'))).HatShuffleIntegrationScreen,
    ),
    '/home/card/skeeball': createHomeRoute(
      async () =>
        (await loading.wrap(import('./app/screens/main/home/card-integration/games'))).SkeeballIntegrationScreen,
    ),
    '/home/card/qb_toss': createHomeRoute(
      async () =>
        (await loading.wrap(import('./app/screens/main/home/card-integration/games'))).QBTossIntegrationScreen,
    ),
    '/home/card/pop-a-shot': createHomeRoute(
      async () =>
        (await loading.wrap(import('./app/screens/main/home/card-integration/games'))).PopAShotIntegrationScreen,
    ),
    '/home/card/tug-of-war': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-integration/games'))).TOWIntegrationScreen,
    ),
    '/home/card/fan-filter-cam': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-integration/games'))).FFCIntegrationScreen,
    ),
    '/home/card/turbo-trivia-2': createHomeRoute(
      async () => (await loading.wrap(import('./app/screens/main/home/card-integration/games'))).TurboTrivia2Screen,
    ),
    '/home/wait': createHomeRoute(async () => (await loading.wrap(import('./app/screens/main/home/wait'))).WaitScreen),
  };

  route(document.querySelector('.app-root'), '/splash', routes);
}

function createMainRoute(fn: () => any) {
  let mainScreen;
  return {
    async onmatch() {
      const [{ MainScreen }, Child] = await loading.wrap(Promise.all([import('./app/screens/main'), fn()]));
      mainScreen = MainScreen;
      return Child;
    },
    render(tag) {
      return m(mainScreen, tag);
    },
  };
}

function createHomeRoute(fn: () => any) {
  let mainScreen;
  let homeScreen;
  return {
    async onmatch() {
      const [{ MainScreen }, { HomeScreen }, Child] = await loading.wrap(
        Promise.all([import('./app/screens/main'), import('./app/screens/main/home'), fn()]),
      );

      mainScreen = MainScreen;
      homeScreen = HomeScreen;
      return Child;
    },
    render(tag) {
      return m(mainScreen, m(homeScreen, tag));
    },
  };
}
