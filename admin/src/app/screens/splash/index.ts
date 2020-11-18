import { ClassComponent } from 'mithril';
import { template } from './template';

export class SplashScreen implements ClassComponent {
  public view() {
    return template.call(this);
  }
}
