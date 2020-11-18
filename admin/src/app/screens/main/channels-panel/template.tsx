import { ChannelsPanel, IChannelsPanelAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { Channel } from './channel';
import { Slide } from '../../../components/slide';
import { ChannelType } from '../../../../../../common/common';
import { UserCount } from './user-count';
import { MAX_CHANNELS } from '../../../utils';

export function template(this: ChannelsPanel, { channels, onsave, selected }: IChannelsPanelAttrs) {
  return (
    <div class={styles.control}>
      <div class={styles.title}>CHANNELS</div>
      {channels.filter((ch) => !ch.deleted).length < MAX_CHANNELS && (
        <div class={styles.buttonAdd} onclick={this.buttonAddChannelHandler.bind(this)}>
          +
        </div>
      )}
      {channels.map((channel) => {
        if (!channel.deleted) {
          return (
            <Channel
              channel={channel}
              channels={channels}
              onsave={onsave}
              onnamechange={this.nameChangeHandler.bind(this)}
              selected={selected.id === channel.id}
              onclick={this.channelClickHandler.bind(this, channel)}
            />
          );
        }
        return null;
      })}
      <div class={styles.groupRight}>
        {selected.type === ChannelType.TIMELINE && (
          <Slide
            class={styles.slideSynced}
            selected={selected.synced}
            onchange={(value) => {
              selected.synced = value;
              onsave(selected);
            }}
            readonly={selected.online}
          >
            Synced
          </Slide>
        )}
        <UserCount channel={selected} channels={channels} onsave={onsave} />
      </div>
    </div>
  );
}
