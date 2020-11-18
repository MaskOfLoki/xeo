import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { IntegratedGame } from '../../../../common/common';
import Swal from 'sweetalert2';

export function toPromise<T>(observable: Observable<T>): Promise<T> {
  return new Promise((resolve) => observable.pipe(first()).subscribe(resolve));
}

const usernameRegex = /^[a-zA-Z0-9_.-]*$/gi;

export const PARTICIPATION_REFRESH_TIME = 1000;

export function isUsernameValid(value: string): boolean {
  return !!value.match(usernameRegex);
}

export function range(start: number, end?: number): Array<number> {
  if (end === undefined) {
    end = start;
    start = 0;
  }

  return Array.from({ length: end - start }, (_, k) => k + start);
}

export interface ISessionPlaybackStatus {
  paused: boolean;
  position: number;
}

export interface IIntegratedGameData {
  gid: IntegratedGame;
}

export async function swalAlert(options: any) {
  const result = Swal.fire(options);
  document.body.classList.remove('swal2-height-auto');
  return await result;
}
