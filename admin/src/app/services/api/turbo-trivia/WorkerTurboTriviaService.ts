import { gcBackend } from '@gamechangerinteractive/xc-backend';
import { GCBackend } from '@gamechangerinteractive/xc-backend/GCBackend';
import { isEmptyString, uuid } from '@gamechangerinteractive/xc-backend/utils';
import { proxy } from 'comlink';
import { IPreset, IState } from '../../../../../../common/common';
import ENV from '../../../../../../common/utils/environment';
import { IGameData, ITurboTriviaState } from '../../../../common/turbo-trivia-2';
import { ITurboTriviaService } from './ITurboTriviaService';

const GAME_ID = 'turbo-trivia-2';

export class WorkerTurboTriviaService implements ITurboTriviaService {
  private _backend: GCBackend;

  public async login(cid: string, uid: string): Promise<void> {
    this._backend = gcBackend.instance();

    await this._backend.init({
      cid,
      gid: GAME_ID,
      buildNum: BUILD_NUM,
      pubnub: {
        // TODO: retrieve publishKey from admin-only firestore doc
        publishKey: 'pub-c-6a8ee5a3-f1dd-4c73-b3f9-377576cba026',
      },
      admin: true,
      firebaseAppName: 'admin-turbo-trivia-2',
      env: ENV,
    });

    await this._backend.auth.loginUID(uid);
  }

  public async getPresets(type: string): Promise<IPreset[]> {
    const snapshot = await this._backend.firestore
      .collection(`games/${GAME_ID}/presets`)
      .where('type', '==', type)
      .get();

    return snapshot.docs.map((doc) => {
      const result: IPreset = doc.data() as IPreset;
      result.id = doc.id;
      return result;
    });
  }

  public watchState<T extends IState>(callback: (value: T) => void, namespace: string[]): any {
    const unwatch = this._backend.state.watch<T>((value) => {
      callback(value);
    }, ...namespace);
    return proxy(() => unwatch());
  }

  public watchConfig<T>(callback: (value: T) => void, namespace: string[]): any {
    const unwatch = this._backend.config.watch<T>((value) => {
      callback(value);
    }, ...namespace);
    return proxy(() => unwatch());
  }

  public async publishGame(
    game: IGameData,
    isFreePlay: boolean,
    isAutoRun: boolean,
    revealCountDown: number,
    intermissionCountDown: number,
  ): Promise<void> {
    let state: ITurboTriviaState = this._backend.state.get<IState>('');

    if (!isEmptyString(state.sid)) {
      await this.resetActive();
    }

    const now = await this.time();

    state = {
      sid: uuid(),
      game,
      startTime: now,
      isFreePlay,
      isAutoRun,
    };

    if (isFreePlay || isAutoRun) {
      state.revealCountDown = revealCountDown;
      state.intermissionCountDown = intermissionCountDown;
    }

    return this._backend.state.set(state, '');
  }

  public time(): Promise<number> {
    return this._backend.time.now();
  }

  public async resetActive(): Promise<void> {
    await this._backend.state.set({}, '');
  }
}
