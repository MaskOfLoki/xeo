import { template } from './template';
import { ClassComponent } from 'mithril';

export class CredentialSettings implements ClassComponent {
  public view() {
    return template.call(this);
  }
}
