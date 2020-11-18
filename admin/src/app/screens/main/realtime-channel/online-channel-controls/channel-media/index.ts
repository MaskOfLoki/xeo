import { ChannelStateComponent, IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';
import { template } from './template';
import { IVideoPlayer } from '../../../../../../../../common/components/video/IVideoPlayer';

export class ChannelMedia extends ChannelStateComponent<IChannelStateAttrs> {
  public player: IVideoPlayer;

  public buttonPlayPauseHandler() {
    if (!this.player) {
      return;
    }

    if (this.player.paused) {
      this.player.play();
    } else {
      this.player.pause();
    }
  }

  public view() {
    return this.channel?.media && template.call(this);
  }
}
