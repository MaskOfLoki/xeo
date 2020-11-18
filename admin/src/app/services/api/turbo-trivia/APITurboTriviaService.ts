import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { proxy } from 'comlink';
import { redraw } from 'mithril';
import { Observable, Subject } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';
import { api } from '..';
import {
  CardStatus,
  CardType,
  ChannelType,
  ICard,
  IChannel,
  IPreset,
  IProject,
  IState,
  ITimelineCard,
} from '../../../../../../common/common';
import { loading } from '../../../../../../common/loading';
import { IGameData, ITriviaProject, ISlot } from '../../../../common/turbo-trivia-2';
import { ITurboTriviaService } from './ITurboTriviaService';

export interface IValidateResult {
  result: string;
  slot: ISlot;
}

export class APITurboTriviaService {
  private _triviaStates: Map<string, Observable<any>> = new Map();
  private _triviaConfigs: Map<string, Observable<any>> = new Map();
  private _xeoStates: Map<string, Observable<any>> = new Map();
  private _xeoConfigs: Map<string, Observable<any>> = new Map();

  private _channels: IChannel[] = [];

  constructor(private _service: ITurboTriviaService) {
    api.project.subscribe(this.projectHandler.bind(this));
  }

  private projectHandler(value: IProject) {
    this._channels = value?.channels ? value.channels : [];

    this._channels.map((channel) => api.state(channel.id).subscribe(this.stateHandler.bind(this, channel.id)));
  }

  private stateHandler(channelID: string, value: IState) {
    this._xeoStates[channelID] = value;
  }

  public async getSlots(): Promise<ISlot[]> {
    const presets: IPreset[] = await this._service.getPresets('project');
    const project: ITriviaProject = presets.find((item) => item.name === 'DEFAULT') as ITriviaProject;

    if (project.slots.length == 0) {
      return [];
    }

    return project.slots;
  }

  public state<T>(...namespace: string[]): Observable<T> {
    let result: Observable<T> = this._triviaStates.get(namespace.join('-'));

    if (result) {
      return result;
    }

    const subject: Subject<T> = new Subject();

    this._service.watchState<T>(
      proxy((value) => {
        subject.next(value);
        redraw();
      }),
      namespace,
    );

    // TODO: implement unwatch
    result = subject.pipe(publishReplay(1), refCount());
    this._triviaConfigs.set(namespace.join('-'), result);
    return result;
  }

  public async publishGame(
    gameData: IGameData,
    isFreePlay: boolean,
    isAutoRun: boolean,
    revealCountDown: number,
    intermissionCountDown: number,
  ): Promise<void> {
    await loading.wrap(
      this._service.publishGame(gameData, isFreePlay, isAutoRun, revealCountDown, intermissionCountDown),
    );
  }

  public config<T>(...namespace: string[]): Observable<T> {
    let result: Observable<T> = this._triviaConfigs.get(namespace.join('-'));

    if (result) {
      return result;
    }

    const subject: Subject<T> = new Subject();

    this._service.watchConfig<T>(
      proxy((value) => {
        subject.next(value);
        redraw();
      }),
      namespace,
    );

    result = subject.asObservable().pipe(publishReplay(1), refCount());

    this._triviaConfigs.set(namespace.join('-'), result);
    return result;
  }

  public async resetActive(): Promise<void> {
    await loading.wrap(this._service.resetActive());
  }

  private validateThroughChannels(cardID: number): boolean {
    const runningCards: ICard[] = [];
    for (const channel of this._channels) {
      if (channel.online) {
        if (channel.type === ChannelType.MANUAL) {
          const state: IState = this._xeoStates[channel.id];
          if (!isEmptyString(state.sid)) {
            state.channel.cards.map((card) => {
              if (
                card.type === CardType.TURBO_TRIVIA_2 &&
                (card.status === CardStatus.LIVE || card.status === CardStatus.DONE)
              ) {
                runningCards.push(card);
              }
            });
          }
        } else if (channel.type === ChannelType.TIMELINE) {
          channel.timeline.cards.map((card: ITimelineCard) => {
            if (card.type === CardType.TURBO_TRIVIA_2 && card.id !== cardID) {
              runningCards.push(card);
            }
          });
        }
      }
    }

    if (runningCards.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  public async validateGame(
    slotID: string,
    isFreePlay: boolean,
    isAutoRun: boolean,
    revealCountDown: number,
    intermissionCountDown: number,
    cardID?: number,
  ): Promise<IValidateResult> {
    let result = '';
    const slots = await api.turbotrivia.getSlots();
    const slot = slots.find((slot) => slot.id === slotID);

    if (!slot) {
      result += 'The question set you selected does not exist.';
      return { result, slot: slot };
    }

    const isValid = this.validateThroughChannels(cardID);

    if (!isValid) {
      result += 'One turbo trivia should be run throughout whole channels.';
      return { result, slot: slot };
    }

    if (slot.data.questions.length === 0) {
      result += 'This slot has no question. Please add some questions to start.';
    }

    if (isNaN(slot.data.titleTimer) || slot.data.titleTimer == null || slot.data.titleTimer === 0) {
      result += '\nPlease, specify timer countdown.';
    }

    if (isNaN(slot.data.questionTimer) || slot.data.questionTimer == null || slot.data.questionTimer === 0) {
      result += '\nPlease, specify question countdown.';
    }

    if (isNaN(slot.data.gamePoints) || slot.data.gamePoints == null || slot.data.gamePoints === 0) {
      result += '\nPlease, specify points countdown.';
    }

    if ((isAutoRun || isFreePlay) && !(revealCountDown >= 2)) {
      result += '\nPlease, input reveal countdown than 2 seconds.';
    }

    if ((isAutoRun || isFreePlay) && !(intermissionCountDown >= 2)) {
      result += '\nPlease, input intermission countdown than 2 seconds.';
    }

    return { result, slot: slot };
  }
}
