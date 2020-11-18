import { ClassComponent, route, redraw } from 'mithril';
import { template } from './template';
import { Unsubscribable } from 'rxjs';
import { api } from '../../../../services/api';
import { map } from 'rxjs/operators';
import {
  IUser,
  IState,
  ISignupField,
  SignupFieldType,
  IMultipleChoiceSignupField,
} from '../../../../../../../common/common';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { isRTMPStream } from '../../../../../../../common/utils';

export class AdditionalUserInfoScreen implements ClassComponent {
  private _fields: ISignupField[] = [];
  private _user: IUser;

  public values: Partial<IUser> = {};
  public hasChannelVideo = false;

  private readonly _subscriptions: Unsubscribable[];

  constructor() {
    this._subscriptions = [
      api.user.subscribe(this.userHandler.bind(this)),
      api.state.subscribe(this.stateHandler.bind(this)),
      api.config.pipe(map((value) => value.signup.fields)).subscribe(this.fieldsHandler.bind(this)),
    ];
  }

  private stateHandler(state: IState): void {
    this.hasChannelVideo = isRTMPStream(state?.channel?.media) || !isEmptyString(state?.channel?.media as string);
    redraw();
  }

  private fieldsHandler(value: ISignupField[]) {
    this._fields = value;
    this.invalidate();
  }

  private userHandler(value: IUser) {
    this._user = value;
    this.invalidate();
  }

  private invalidate() {
    if (this._fields.length === 0 || !this._user) {
      return;
    }

    this.values = {};
    this._fields.forEach((field) => {
      this.values[field.name] = this._user[field.name];

      if (field.type === SignupFieldType.MULTIPLE_CHOICE) {
        const select = field as IMultipleChoiceSignupField;
        // Default to having the first option selected
        if (this.values[field.name] === undefined) {
          this.values[field.name] = select.options[0];
        } else if (!select.options.find((item) => item === this.values[field.name])) {
          // If the selected value no longer exists, make them choose again
          delete this.values[field.name];
        }
      }
    });

    if (!route.get().includes('profile')) {
      this._fields = this._fields.filter((field) => isEmptyString(this._user[field.name]));
    }

    redraw();
  }

  public async buttonSaveHandler() {
    await api.updateUser(this.values);

    if (route.get().includes('profile')) {
      route.set('/profile');
    }
  }

  public buttonCancelhandler() {
    if (route.get().includes('profile')) {
      route.set('/profile');
    } else {
      //console.log("buttonCancelhandler home1");
      route.set('/home');
    }
  }

  public onremove() {
    this._subscriptions.forEach((item) => item.unsubscribe());
  }

  public view() {
    return template.call(this);
  }

  public get fields(): ISignupField[] {
    return this._fields;
  }

  public get isSaveAvailable(): boolean {
    return !this._fields.some((field) => isEmptyString(this.values[field.name]));
  }
}
