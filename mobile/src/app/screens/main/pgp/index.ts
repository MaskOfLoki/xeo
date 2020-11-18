import { api } from '../../../services/api';
import { template } from './template';
import { getQueryParam } from '../../../../../../common/utils/query';
import { isDeployed } from '../../../../../../common/utils';
import { ClassComponent } from 'mithril';

export class PGPScreen implements ClassComponent {
  public view() {
    return template.call(this);
  }

  public get url(): string {
    let value: string;

    if (isDeployed()) {
      const nextDeployStack = window.location.pathname.includes('next') ? 'next/' : '';
      value = `${window.location.origin}/${nextDeployStack}predictive-platform?uid=${api.uid}`;
    } else {
      value = `http://localhost:8091?gcClientId=${getQueryParam('gcClientId')}&uid=${api.uid}`; // Integrated games live on 8091
    }

    return value + '&xeo';
  }
}
