import { template } from './template';
import { ClassComponent } from 'mithril';
import { IRTMPStream } from '../../../../../../../common/common';
import { StreamsList } from './streams-list';

export class StreamSettings implements ClassComponent {
  public selectedStream: IRTMPStream;
  public streamsList: StreamsList;

  public buttonAddNewStreamHandler() {
    this.selectedStream = {
      id: undefined,
      playerId: undefined,
      streamUrl: undefined,
      name: '',
      sourceUrl: '',
      type: 'rtmp-stream',
    };
  }

  public streamSaveHandler(value: IRTMPStream) {
    this.streamsList.refresh();
    this.selectedStream = value;
  }

  public view() {
    return template.call(this);
  }
}
