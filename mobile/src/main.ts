import { route } from 'mithril';
import { filter, first, startWith } from 'rxjs/operators';

import { loading } from '../../common/loading';
import { isEmptyString, isIOS } from '@gamechangerinteractive/xc-backend/utils';
import { initRoutes } from './main.routes';

import './styles.scss';
import { combineLatest } from 'rxjs';
import { deviceService } from './app/services/DeviceService';
import { isPreview } from '../../common/utils/query';
import { IConfig, IUser } from '../../common/common';
import { disableBodyScroll } from 'body-scroll-lock';
import { api } from './app/services/api';

// eslint-disable-next-line
console.info(`%c XEO Mobile, ${BRANCH}, build ${BUILD_NUM}`, 'background: #222; color: #bada55');

if (deviceService.isDesktop) {
  document.getElementsByTagName('html')[0].setAttribute('class', 'desktop');
}

async function main() {
  fixIOSZoom();
  const inputHash = location.hash;
  location.href = '#/splash';
  initRoutes();
  const [{ api }, { config }, { orientation }, { initService }] = await loading.wrap(
    Promise.all([
      import('./app/services/api'),
      import('./app/services/ConfigService'),
      import('./app/services/OrientationService'),
      import('./app/services/init'),
    ]),
  );
  orientation.start();
  await api.init();
  await config.init();

  const user = await api.isLoggedIn();

  if (!user && !config.signup.anonymous) {
    route.set('/frontgate');
  } else if (config.signup.anonymous) {
    await api.loginAnonymously();
  }

  combineLatest([api.user.pipe(startWith(null as IUser)), api.config])
    .pipe(
      filter(([user, config]) => {
        if (!user && route.get() === '/frontgate' && config?.signup?.anonymous) {
          api.loginAnonymously();
          return false;
        }

        if (!user) {
          return false;
        }

        if (isEmptyString(user.username) || (!config?.signup?.anonymous && isEmptyString(user.email))) {
          route.set('/userinfo');
          return false;
        }

        if (user.avatar == null && user.avatarUrl == null) {
          route.set('/avatar-select');
          return false;
        }

        if (
          !isPreview() &&
          !config?.signup?.anonymous &&
          config.signup.fields.some((field) => isEmptyString(user[field.name]))
        ) {
          route.set('/additional-user-info');
          return false;
        }

        return true;
      }),
      first(),
    )
    .subscribe(([, config]) => {
      if (!config.audioSplash?.enabled || isPreview() || isIOS()) {
        initService.start(`/${config.signup?.defaultScreen ?? 'home'}`);
      } else {
        route.set('/audio-splash');
      }
    });
}

async function setDeepRoute(inputHash, config: IConfig) {
  const hashSections = inputHash.split('/');
  switch (hashSections[1]) {
    case 'arcade':
      if (!hashSections[2]) {
        route.set('/arcade');
      } else {
        const games = await api.getGames();
        if (games.find((game) => game.id === hashSections[2]) && config.arcade[`enable-${hashSections[2]}`]) {
          route.set(`/arcade/${hashSections[2]}`);
        } else {
          route.set('/arcade');
        }
      }
      break;
    case 'prizes':
    case 'profile':
    case 'rank':
    case 'chat':
      route.set(`/${hashSections[1]}`);
      break;
    case 'home':
    default:
      //console.log('deeproute home');
      route.set('/home');
      break;
  }
}

function fixIOSZoom() {
  if (!isIOS()) {
    return;
  }

  disableBodyScroll(document);

  document.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    },
    { passive: false },
  );

  let lastTouchEnd = 0;

  document.addEventListener(
    'touchend',
    (event) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 500) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false,
  );
}

main();
