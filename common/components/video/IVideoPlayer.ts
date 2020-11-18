import { ITimeService } from '../../common';

export interface IVideoPlayer {
  dispose(): void;
  play(): void;
  pause(): void;
  muted: boolean;
  autoplay: boolean;
  seek(milliseconds: number): void;
  readonly paused: boolean;
  readonly duration: number;
  readonly position: number;
}

export interface IVideoPlayerAttrs {
  ref?: (value: IVideoPlayer) => void;
  src?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  time?: ITimeService;
}
