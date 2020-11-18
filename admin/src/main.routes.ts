import { route } from 'mithril';
import { SplashScreen } from './app/screens/splash';
import { loading } from '../../common/loading';

export function initRoutes() {
  const routes = {
    '/splash': SplashScreen,
    '/': {
      onmatch: async () => (await loading.wrap(import('./app/screens/main'))).MainScreen,
    },
  };

  route(document.querySelector('.app-root'), '/splash', routes);
}
