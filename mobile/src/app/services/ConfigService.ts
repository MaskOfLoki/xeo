import { api } from './api';
import { orientation } from './OrientationService';
import { IConfig, fillDefaultConfig } from '../../../../common/common';
import { race, Subject, timer, Unsubscribable } from 'rxjs';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { getColor, isEmptyObject } from '../../../../common/utils';
import { redraw } from 'mithril';
import { toPromise } from '../utils';
import { skip } from 'rxjs/operators';

class ConfigService implements IConfig {
  private _config: IConfig = fillDefaultConfig();
  private _subject: Subject<IConfig> = new Subject();
  private _styleFont: HTMLElement;
  private _font: string;

  public init(): Promise<void> {
    orientation.subscribe(this.orientationHandler.bind(this));
    api.config.subscribe(this.configHandler.bind(this));

    // we're skipping first 2 emits to make sure config is synced with the server
    return toPromise(race(api.config.pipe(skip(2)), timer(5000))) as Promise<void>;
  }

  private orientationHandler() {
    this.refreshBackground();
  }

  private configHandler(value: IConfig) {
    this._config = value;
    this.updateFont(value.home.font);
    this.preprocessColors();
    this.refreshBackground();
    this._subject.next(value);
    redraw();
  }

  private refreshBackground() {
    const value = this._config;

    let hasBackground = false;

    if (!isEmptyObject(value.home.images?.background)) {
      if (orientation.isPortrait) {
        (document.querySelector(
          '.body-background',
        ) as HTMLDivElement).style.backgroundImage = `url(${value.home.images.background.portrait})`;
      } else {
        (document.querySelector(
          '.body-background',
        ) as HTMLDivElement).style.backgroundImage = `url(${value.home.images.background.landscape})`;
      }
      hasBackground = true;
    } else {
      (document.querySelector('.body-background') as HTMLDivElement).style.backgroundImage = '';
    }

    if (value.home.colors.tertiary) {
      (document.querySelector('.body-background') as HTMLDivElement).style.backgroundImage += `${
        hasBackground ? ', ' : ''
      }linear-gradient(to bottom, ${value.home.colors.tertiary.foreground}, ${value.home.colors.tertiary.background})`;
    }

    document.body.style.color = value.home.colors.levels[1] as string;
  }

  private updateFont(value: string) {
    if (this._font === value) {
      return;
    }

    if (this._styleFont) {
      document.head.removeChild(this._styleFont);
      this._styleFont = undefined;
    }

    this._font = value;

    if (isEmptyString(value)) {
      document.body.style.fontFamily = '';
      return;
    }

    this._styleFont = document.createElement('style');
    this._styleFont.appendChild(
      document.createTextNode(`
            @font-face {
                font-family: Presenter Custom Font;
                src: url(${value});
            }`),
    );

    document.head.appendChild(this._styleFont);
    document.body.style.fontFamily = 'Presenter Custom Font';
  }

  public subscribe(callback: () => void): Unsubscribable {
    return this._subject.subscribe(callback);
  }

  public getConfig(path?: string): any {
    const parts = path.split('.');
    let result: any = this._config;

    while (parts.length && typeof result == 'object') {
      result = result[parts.shift()];
    }

    return result;
  }

  public get home() {
    return this._config.home;
  }

  public get leaderboard() {
    return this._config.leaderboard;
  }

  public get signup() {
    return this._config.signup;
  }

  public get points() {
    return this._config.points || {};
  }

  public get optIn() {
    return this._config.optin || {};
  }

  public get audioSplash() {
    return this._config.audioSplash ?? {};
  }

  public get program() {
    return this._config.program ?? {};
  }

  private preprocessColors(): void {
    for (const scope of Object.keys(this._config)) {
      const obj = this._config[scope];
      if (typeof obj === 'object' && obj.colors) {
        for (const color of Object.keys(obj.colors)) {
          if (typeof obj.colors[color] === 'object') {
            obj.colors[color].toString = getColor.bind(undefined, obj.colors[color]);
          }
        }
      }
    }
  }
}

export const config: ConfigService = new ConfigService();
