import { IPreset } from '../../../../../../common/common';
import { IGameData } from '../../../../common/turbo-trivia-2';

export interface ITurboTriviaService {
  getPresets(type: string): Promise<IPreset[]>;

  watchState<T>(callback: (value: T) => void, namespaces: string[]): Promise<VoidFunction>;

  watchConfig<T>(callback: (value: T) => void, namespaces: string[]): Promise<VoidFunction>;

  publishGame(
    game: IGameData,
    isFreePlay: boolean,
    isAutoRun: boolean,
    revealCountDown: number,
    intermissionCountDown: number,
  ): Promise<void>;

  resetActive(): Promise<void>;
}
