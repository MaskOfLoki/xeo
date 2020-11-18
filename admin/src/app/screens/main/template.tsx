import { MainScreen } from './index';
import styles from './module.scss';
import m from 'mithril';
import { Header } from './header';
import { ChannelsPanel } from './channels-panel';
import { ChannelType } from '../../../../../common/common';
import { RealtimeChannel } from './realtime-channel';
import { ProgrammedChannel } from './programmed-channel';

export function template(this: MainScreen) {
  const channels = (this.project?.channels ?? []).sort((a, b) => {
    if (a.id === '') {
      return -1;
    }
    if (b.id === '') {
      return 1;
    }
    return 0;
  });

  return (
    this.channel && (
      <div class={styles.screen + ' main'}>
        <Header
          channel={this.channel}
          onsave={this.saveChannelHandler.bind(this)}
          onrestore={this.restoreChannelHandler.bind(this)}
          ondelete={this.deleteChannelHandler.bind(this)}
          ondeleteexpired={this.deleteExpiredChannelHandler.bind(this)}
          channels={channels}
        />
        <ChannelsPanel
          channels={channels}
          onsave={this.saveChannelHandler.bind(this)}
          selected={this.channel}
          onchange={this.selectedChannelChangeHandler.bind(this)}
        />
        {this.channel.type === ChannelType.MANUAL && (
          <RealtimeChannel channel={this.channel} onsave={this.saveChannelHandler.bind(this)} />
        )}
        {this.channel.type === ChannelType.TIMELINE && (
          <ProgrammedChannel channel={this.channel} onsave={this.saveChannelHandler.bind(this)} />
        )}
      </div>
    )
  );
}
