import { ReplaySubject, Subject, Unsubscribable } from 'rxjs';

declare const audioinput: any;

export class MicService {
  public static MIC_UPDATED = 'micUpdated';

  private _audioContext: AudioContext;
  public gainValue: number;
  private _stream: any;
  private _analyser: any;
  private _microphone: any;
  private _processor: any;
  private readonly _subject: Subject<number> = new ReplaySubject(1);

  constructor() {
    this.gainValue = parseFloat(localStorage.getItem('gainLevel') || '1.0');
  }

  public updateGainValue(value: number): void {
    this.gainValue = value;
  }

  public async start(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const listener = () => {
        document.removeEventListener('click', listener);

        try {
          const AudioContext = window['AudioContext'] || window['webkitAudioContext'];
          this._audioContext = new AudioContext();
          this._audioContext.resume();

          // eslint-disable-next-line
          navigator.getUserMedia = navigator.getUserMedia || navigator['webkitGetUserMedia'] || navigator['mozGetUserMedia'] || navigator['msGetUserMedia'];

          if (navigator.getUserMedia) {
            navigator.getUserMedia(
              { audio: true },
              (stream) => {
                this.getStreamHandler(stream);
                resolve();
              },
              reject,
            );
          } else if (navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices
              .getUserMedia({ audio: true })
              .then((stream) => {
                this.getStreamHandler(stream);
                resolve();
              })
              .catch(reject);
          } else {
            reject('mic not supported');
          }
        } catch (e) {
          console.error(e);
          reject(e);
        }
      };

      document.addEventListener('click', listener);
    });
  }

  private getStreamHandler(stream?: any): void {
    this._stream = stream;
    this._analyser = this._audioContext.createAnalyser();

    this._microphone = this._audioContext.createMediaStreamSource(stream);

    this._processor = this._audioContext.createScriptProcessor(2048, 1, 1);
    this._analyser.smoothingTimeConstant = 0.3;
    this._analyser.fftSize = 1024;

    this._microphone.connect(this._analyser);
    this._analyser.connect(this._processor);
    this._processor.connect(this._audioContext.destination);
    this._processor.onaudioprocess = () => this.audioProcessHandler(this._analyser);
  }

  public stop(): void {
    if (this._stream == null) {
      return;
    }

    this._processor.onaudioprocess = null;
    this._processor.disconnect();
    this._analyser.disconnect();
    this._microphone.disconnect();

    const tracks: any[] = this._stream.getAudioTracks();

    for (const t of tracks) {
      t.stop();
    }
  }

  private audioProcessHandler(analyser: any): void {
    const array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    let values = 0;

    const length: number = array.length;

    for (let i = 0; i < length; i++) {
      values += array[i];
    }

    //calculate the RMS
    let level: number = Math.sqrt((values / length) * 0.5);
    //only return the top ~66% of volume levels, still clamped between 0 and 10
    level = Math.max(0, Math.min(10, (level * 1.5 - 4) * this.gainValue));

    this._subject.next(level);
  }

  public subscribe(callback: (value: number) => void): Unsubscribable {
    return this._subject.subscribe(callback);
  }
}

export const micService = new MicService();
