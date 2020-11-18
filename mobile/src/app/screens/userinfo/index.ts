import { template } from './template';
import { api } from '../../services/api';
import { isEmailValid } from '../../../../../common/utils';
import { isUsernameValid, swalAlert } from '../../utils';
import { route } from 'mithril';
import { ClassBaseComponent } from '../../components/class-base';
import { filterService } from '../../services/FilterService';
import { config } from '../../services/ConfigService';

export const MIN_USERNAME = 6;
export const MAX_USERNAME = 15;

export class UserInfoScreen extends ClassBaseComponent {
  public username = '';
  public email = '';
  public over13 = true;
  public userOptin = false;

  constructor() {
    super();
    this.userOptin = config.signup?.anonymous ? !!config.optIn?.defaultChecked : false;
  }

  public async buttonSaveHandler() {
    if (!(await this.validate())) {
      return;
    }

    api.updateUser({
      username: this.username,
      email: this.email || null,
      over13: this.over13,
      optIn: this.userOptin,
    });

    route.set('/profile');
  }

  private async validate(): Promise<boolean> {
    this.username = this.username.trim();

    if (this.username.length < MIN_USERNAME) {
      swalAlert({
        icon: 'warning',
        title: 'Please, provide username with at least 6 characters',
      });
      return false;
    }

    if (this.username.length > MAX_USERNAME) {
      swalAlert({
        icon: 'warning',
        title: `Please, provide username with at most ${MAX_USERNAME} characters`,
      });
      return false;
    }

    if (!isUsernameValid(this.username)) {
      swalAlert({
        icon: 'warning',
        title: 'Please, provide username without special characters or spaces',
      });
      return false;
    }

    const isAvailable: boolean = await api.isUsernameAvailable(this.username);

    if (!isAvailable || !(await filterService.isCleanUsername(this.username))) {
      swalAlert({
        icon: 'warning',
        title: 'Please, provide another username',
      });
      return false;
    }

    if (!config.signup?.anonymous) {
      this.email = this.email.trim();

      if (!isEmailValid(this.email)) {
        swalAlert({
          icon: 'warning',
          title: 'Please, provide valid email',
        });
        return false;
      }
    }

    if (!this.over13) {
      swalAlert({
        icon: 'warning',
        title: 'Users must be over the age of 13 to participate',
      });
      return false;
    }

    return true;
  }

  public view() {
    return template.call(this);
  }
}
