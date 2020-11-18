import { GCRPC } from '@gamechangerinteractive/xc-backend/GCRPC';
import { gcBackend } from '@gamechangerinteractive/xc-backend';
import { delay } from '../../../../common/utils';
import ENV from '../../../../common/utils/environment';

interface IQueueItem {
  phones: string[];
  message: string;
  image?: string;
}

interface IQueueDictionary {
  [key: number]: IQueueItem;
}

export class SmsService extends GCRPC {
  private _batchSize = 25;
  private _currentQueueIndex = 0;
  private _maxQueueIndex = 0;
  private _currentBatchIndex = 0;
  private _queue: IQueueDictionary = {};

  constructor() {
    super(ENV.SMS_URL, gcBackend);
  }

  public send(phones: string[], message: string, imageUrl?: string): Promise<void> {
    return this.call('send', phones, message, imageUrl);
  }

  public sendInQueue(phones: string[], message: string, imageUrl?: string): Promise<number> {
    this._queue[this._maxQueueIndex] = {
      phones,
      message,
      image: imageUrl,
    };

    this.sendNextBatch();

    return Promise.resolve(this._maxQueueIndex++);
  }

  public getSentCount(queueId: number): Promise<number> {
    if (this._queue[queueId]) {
      if (this._currentQueueIndex === queueId) {
        return Promise.resolve(this._currentBatchIndex);
      } else {
        return Promise.resolve(0);
      }
    }

    return Promise.resolve(-1);
  }

  private async sendNextBatch() {
    if (this._queue[this._currentQueueIndex]) {
      const queue = this._queue[this._currentQueueIndex];
      const phones = queue.phones
        .slice(this._currentBatchIndex, this._currentBatchIndex + this._batchSize)
        .filter((phone) => /^\w{10,}$/.test(phone));

      const now = Date.now();
      if (phones.length > 0) {
        try {
          await this.call('send', phones, queue.message, queue.image);
        } catch (e) {
          console.warn('SMSService.sendSingle', e);
        }
      }

      this._currentBatchIndex += this._batchSize;
      if (this._currentBatchIndex >= queue.phones.length) {
        delete this._queue[this._currentQueueIndex];
        this._currentQueueIndex++;
        this._currentBatchIndex = 0;
      }

      const dif = Date.now() - now;

      if (dif < 300) {
        await delay(300 - dif);
      }

      this.sendNextBatch();
    }
  }
}
