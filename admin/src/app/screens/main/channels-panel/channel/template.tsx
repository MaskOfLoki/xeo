import { Channel, IChannelAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { ContextMenu } from '../../../../components/context-menu';
import { ChannelType } from '../../../../../../../common/common';
import cn from 'classnames';

export function template(this: Channel, { channel, selected, onclick }: IChannelAttrs) {
  const menuItems = [
    {
      title: channel.online ? 'Go Offline' : 'Go Online',
      fn: this.buttonGoHandler.bind(this),
    },
    {
      title: 'Channel Settings',
      fn: this.settingsHandler.bind(this),
    },
    {
      title: 'Change Name',
      fn: this.changeNameHander.bind(this),
    },
    {
      title: 'Mobile URL',
      fn: this.mobileURLHandler.bind(this),
    },
    {
      title: 'Mainboard URL',
      fn: this.mainboardURLHandler.bind(this),
    },
    {
      title: 'XML Feed',
      fn: this.feedHandler.bind(this, 'xml'),
    },
    {
      title: 'JSON Feed',
      fn: this.feedHandler.bind(this, 'json'),
    },
    {
      title: 'Launch Admin Panel',
      fn: this.launchAdminHandler.bind(this),
    },
  ];

  if (!this.disableActionBoard) {
    menuItems.push({
      title: 'Launch Realtime Action Board',
      fn: this.actionBoardHandler.bind(this),
    });
  }

  if (!channel.online) {
    if (!this.isRealTimeOnly || channel.type === ChannelType.TIMELINE) {
      menuItems.push({
        title: `Switch to ${channel.type === ChannelType.TIMELINE ? 'REALTIME' : 'PROGRAMMING'}`,
        fn: this.buttonTypeHandler.bind(this),
      });
    }

    menuItems.push(
      {
        title: 'Export',
        fn: this.exportChannelHandler.bind(this),
      },
      {
        title: 'Import',
        fn: this.importChannelHandler.bind(this),
      },
      {
        title: 'Snapshots',
        fn: this.snapshotsHandler.bind(this),
      },
    );

    if (channel.id !== '') {
      menuItems.push({
        title: 'Delete Channel',
        fn: this.deleteChannelHandler.bind(this),
      });
    }
  }

  return (
    <ContextMenu items={menuItems}>
      <div
        class={cn(styles.control, {
          [styles.selected]: selected,
          [styles.programmed]: channel.type === ChannelType.TIMELINE,
        })}
        onclick={onclick}
      >
        <div class={styles.status}>{channel.online ? 'Online' : 'Offline'}</div>
        <div class={styles.name}>{channel.name}</div>
        <div class={styles.default}>{isEmptyString(channel.id) ? 'default' : ''}</div>
      </div>
    </ContextMenu>
  );
}
