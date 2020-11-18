import { GCRPC } from '@gamechangerinteractive/xc-backend/GCRPC';
import { gcBackend } from '@gamechangerinteractive/xc-backend';
import ENV from './environment';

export class WowzaService extends GCRPC {
  constructor() {
    super(ENV.WOWZA_URL, gcBackend);
  }

  public create(rtmpUrl: string): Promise<IWowzaLiveStream> {
    return this.call('create', rtmpUrl);
  }

  public start(streamId: string): Promise<void> {
    return this.call('start', streamId);
  }

  public state(streamId: string): Promise<string> {
    return this.call('state', streamId);
  }

  public stop(streamId: string) {
    return this.call('stop', streamId);
  }

  public remove(streamId: string): Promise<void> {
    return this.call('remove', streamId);
  }
}

export interface IWowzaLiveStream {
  id: string;
  player_id: string;
  player_hls_playback_url: string;
}
