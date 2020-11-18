import { ClassComponent, Vnode } from 'mithril';
import { Unsubscribable } from 'rxjs';
import { ICard, IChannel, IConfig, fillDefaultConfig } from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import { VERSION } from '../../../../../../../common/constants/misc';

export interface IBaseEditAttrs {
  card: ICard;
  channel: IChannel;
  onchange: () => void;
  ref: (value: BaseEdit) => void;
}

export abstract class BaseEdit implements ClassComponent<IBaseEditAttrs> {
  protected _card: ICard;
  protected _onchange: () => void;
  protected _config: IConfig = fillDefaultConfig();
  protected _channel: IChannel;
  private _subscription: Unsubscribable;

  public quickAddComponent: BaseEdit;

  public oninit({ attrs }: Vnode<IBaseEditAttrs>) {
    if (attrs.channel == null) {
      console.warn(`channel isn't provided: ` + this.constructor.name);
    }

    this._channel = attrs.channel;
    this._subscription = api.config('common', attrs.channel?.id).subscribe(this.configHandler.bind(this));
    this._card = attrs.card;

    if (!this._card.colors) {
      this._card.colors = this.defaultColors();
    }

    if (!this._card.images) {
      this._card.images = {};
    }

    if (!this._card.metadata) {
      this._card.metadata = {
        version: VERSION,
      };
    }

    this._onchange = attrs.onchange;
    attrs.ref(this);
  }

  protected configHandler(value: IConfig) {
    value = fillDefaultConfig(value);
    this._config = value;
  }

  public validate(): boolean {
    if (this.quickAddComponent && !this.quickAddComponent.validate()) {
      return false;
    }

    return true;
  }

  abstract view(vnode?: Vnode<IBaseEditAttrs>);

  public onremove() {
    this._subscription.unsubscribe();
  }

  public get config(): IConfig {
    return this._config;
  }

  protected defaultColors() {
    return {};
  }
}
