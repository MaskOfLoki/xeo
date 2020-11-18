import './styles.scss';
import { initRoutes } from './main.routes';
import { route } from 'mithril';
import { loading } from '../../common/loading';
import { first } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

// eslint-disable-next-line
console.info(`%c XEO Admin, ${BRANCH}, build ${BUILD_NUM}`, 'background: #222; color: #bada55');

async function main() {
  location.hash = '#!/splash';
  initRoutes();
  const { api } = await loading.wrap(import('./app/services/api'));
  await api.init();

  combineLatest([api.state(''), api.turbotrivia.state('')])
    .pipe(first())
    .subscribe((v) => {
      route.set('/');
    });
}

main();
