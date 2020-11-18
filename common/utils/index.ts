import { GradientType, GradientDirection, IGradientStep } from '../types/Gradients';
import { ColorValue } from '../types/Color';
import { EmbeddedVideo } from '../types/EmbeddedVideo';
import { Observable } from 'rxjs/internal/Observable';
import { IState, ICard, IParticipation, IRTMPStream } from '../common';
import { deepMerge, isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

/**
 *
 *
 * @export
 * @param {Object} value
 * @returns {boolean}
 */
export function isEmptyObject(value: Record<string, any>): boolean {
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}

/**
 *
 *
 * @export
 * @param {number} value
 * @returns {Promise<void>}
 */
export function delay(value: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, value));
}

/**
 * Take an Indexable type and translate it to an array for iteration
 *
 * @export
 * @param {{ [index: string]: T; } | { [index: number]: T; }} obj
 * @returns {Array<T>}
 */
export function propsToArray<T>(obj: { [index: string]: T } | { [index: number]: T }): Array<T> {
  return Object.keys(obj).map((prop) => obj[prop]);
}

export function numberWithCommas(x: number): string {
  if (x == null) {
    return '';
  }

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function removeNulls(value) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] == null) {
        value.splice(i, 1);
        i--;
      }
    }
  }

  if (typeof value !== 'object') {
    return;
  }

  for (const s in value) {
    if (value[s] == null) {
      delete value[s];
    } else {
      removeNulls(value[s]);
    }
  }
}

export function deepSet(path: string, target, value) {
  const keys = path.split('.');

  let current = target;

  while (keys.length) {
    const key = keys.shift();
    if (!keys.length) {
      current[key] = value;
      break;
    } else if (typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
}

export function mergeNulls(target, source) {
  if (typeof target !== 'object' || typeof source !== 'object') {
    return;
  }

  for (const s in target) {
    if (typeof source[s] === 'undefined') {
      target[s] = null;
    } else {
      mergeNulls(target[s], source[s]);
    }
  }
}

export function getFieldValue<T, S>(target: T, field: string): S {
  const fieldParts = field.split('.');
  let fieldValue: any = target;

  while (fieldParts.length > 0) {
    const fieldPart = fieldParts.shift();

    if (fieldValue[fieldPart] == null) {
      fieldValue = undefined;
      break;
    }

    fieldValue = fieldValue[fieldPart];
  }

  return fieldValue;
}

export function setFieldValue<T, S>(target: T, field: string, value: S) {
  deepMerge(target, buildObjectByFieldValue(field, value));
}

export function buildObjectByFieldValue<T, S>(field: string, value: S) {
  const fieldParts = field.split('.');
  const obj = {};
  let objPart = obj;

  while (fieldParts.length > 1) {
    const fieldPart = fieldParts.shift();
    objPart = objPart[fieldPart] = {};
  }

  objPart[fieldParts.shift()] = value;
  return obj;
}

export function buildGradientString({
  type,
  direction,
  steps,
}: {
  type: GradientType;
  direction: GradientDirection;
  steps: IGradientStep[];
}): string {
  let value = '';
  if (steps.length > 1) {
    const gtype = getGradientType(type);
    const dirStr = getGradientDirection(type, direction);
    const stepStr = getIGradientSteps(steps);
    value = `${gtype}(${dirStr},${stepStr})`;
  } else {
    value = steps[0].color;
  }

  return value;
}

function getGradientType(type: GradientType): string {
  switch (type) {
    case GradientType.Linear:
      return 'linear-gradient';
    default:
      return 'radial-gradient';
  }
}

function getGradientDirection(type: GradientType, direction: GradientDirection): string {
  switch (type) {
    case GradientType.Circular:
      return `circle ${direction}`;
    default:
      return direction;
  }
}

function getIGradientSteps(steps: IGradientStep[]): string {
  return steps.map((step) => `${step.color} ${step.position}%`).join(',');
}

export function getColor(value: ColorValue): string {
  if (typeof value === 'string') {
    return value;
  }

  const temp = value;

  if (temp.generatedStyle) {
    return temp.generatedStyle;
  }

  return (temp.generatedStyle = buildGradientString(temp));
}

export function getFileExtension(url: string): string {
  return url.split(/[#?]/)[0].split('.').pop().trim();
}

const imageExtensions = ['png', 'jpg', 'jpeg', 'svg'];

export function isImageURL(url: string): boolean {
  return imageExtensions.includes(getFileExtension(url).toLowerCase());
}

export function parseVideoURL(url: string) {
  if (isEmptyString(url)) {
    console.warn('parseVideoURL: url is empty');
    return;
  }
  // - Supported YouTube URL formats:
  //   - http://www.youtube.com/watch?v=My2FRPA3Gf8
  //   - http://youtu.be/My2FRPA3Gf8
  //   - https://youtube.googleapis.com/v/My2FRPA3Gf8
  // - Supported Vimeo URL formats:
  //   - http://vimeo.com/25451551
  //   - http://player.vimeo.com/video/25451551
  // - Also supports relative URLs:
  //   - //player.vimeo.com/video/25451551

  if (url.startsWith('rtmp://')) {
    return {
      type: EmbeddedVideo.RTMP,
    };
  }

  // To allow for relative urls
  if (!url.startsWith('http')) {
    if (!url.startsWith('//')) {
      url = '//' + url;
    }

    url = 'http:' + url;
  }

  const u = new URL(url);
  let type: EmbeddedVideo;
  let id: string;
  const path = u.pathname.substr(1);
  const parts = path.split('/');

  if (u.host.includes('youtu')) {
    type = EmbeddedVideo.YouTube;
    if (u.host.includes('googleapis')) {
      if (parts.length == 2 && parts[0] === 'v') {
        id = parts[1];
      } else {
        type = undefined;
      }
    } else if (path === 'watch') {
      if (u.searchParams.has('v')) {
        id = u.searchParams.get('v');
      } else {
        type = undefined;
      }
    } else if (path !== '') {
      id = path;
    } else {
      type = undefined;
    }
  } else if (u.host.includes('vimeo')) {
    type = EmbeddedVideo.Vimeo;
    switch (parts.length) {
      case 1:
        if (parts[0] !== '') {
          id = parts[0];
        } else {
          type = undefined;
        }
        break;
      case 2:
        if (parts[0] === 'video' && parts[1] !== '') {
          id = parts[1];
        } else {
          type = undefined;
        }
        break;
      default:
        type = undefined;
        break;
    }
  } else if (u.host.includes('twitch')) {
    type = EmbeddedVideo.Twitch;
    switch (parts.length) {
      case 1:
        if (parts[0] !== '') {
          id = parts[0];
        } else {
          type = undefined;
        }
        break;
      case 2:
        if (parts[0] === 'videos' && parts[1] !== '') {
          id = parts[1];
        } else {
          type = undefined;
        }
        break;
      default:
        type = undefined;
    }
  }

  return {
    type,
    id,
  };
}

export function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = () => resolve();
    script.onerror = reject;
    script.src = url;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
  });
}

export function throttle<T extends Function>(fn: T, delayMs = 500): VoidFunction {
  let tArgs;
  let isRunning = false;

  return function (...args): void {
    tArgs = args;

    if (isRunning) {
      return;
    }

    isRunning = true;
    setTimeout(() => {
      isRunning = false;
      fn(...tArgs);
    }, delayMs);
  };
}

export function debounce<T extends Function>(fn: T, delayMs = 500): VoidFunction {
  let tArgs;
  let timer: number;

  return function (...args): void {
    tArgs = args;
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...tArgs), delayMs);
  };
}

export function isDeployed(): boolean {
  return /xeo.+\.com/.test(window.location.origin);
}

export interface IAPIService {
  state: (namespace: string) => Observable<IState> | Observable<IState>;
  time(): number;
  getParticipation(card: ICard, channelId: string): Promise<IParticipation>;
}

export function isRTMPStream(value: string | IRTMPStream): boolean {
  return !!value && typeof value === 'object' && 'streamUrl' in value;
}

// eslint-disable-next-line
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export function isEmailValid(value: string): boolean {
  return emailRegex.test(value);
}

export const convertHexToRGBA = (hexCode: string, opacity: number) => {
  let hex = hexCode.replace('#', '');

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r},${g},${b},${opacity})`;
};
