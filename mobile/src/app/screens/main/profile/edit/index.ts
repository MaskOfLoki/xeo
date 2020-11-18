import { redraw } from 'mithril';
import { IUser } from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import { UserInfoScreen } from '../../../userinfo';

import { template } from './template';

export class EditProfileScreen extends UserInfoScreen {
  private _user: IUser;
  private _isAdditionalInfoAvailable: boolean;

  constructor() {
    super();
    this._subscriptions.push(
      api.user.subscribe(this.userHandler.bind(this)),
      api.config.subscribe((value) => (this._isAdditionalInfoAvailable = value.signup.fields.length > 0)),
    );
  }

  private userHandler(value: IUser) {
    this._user = value;
    this.userOptin = this._user.optIn;
    this.username = this._user.username;
    this.email = this._user.email;
    this.over13 = this._user.over13;
    redraw();
  }

  public toggleOptin() {
    this.userOptin = !this.userOptin;
    redraw();
  }

  public view() {
    return template.call(this);
  }

  public get isSaveAvailable(): boolean {
    return (
      this.username.trim() !== this._user?.username ||
      this.email.trim() !== this._user?.email ||
      this.userOptin !== this._user.optIn
    );
  }

  public get isAdditionalInfoAvailable(): boolean {
    return this._isAdditionalInfoAvailable;
  }
}
