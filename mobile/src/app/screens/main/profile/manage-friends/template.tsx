import { ManageFriendsScreen } from './index';
import styles from './module.scss';
import m from 'mithril';
import { config } from '../../../../services/ConfigService';
import cn from 'classnames';
import { Button } from '../../../../components/button';
import { api } from '../../../../services/api';

export function template(this: ManageFriendsScreen) {
  return (
    <div class={styles.screen}>
      <div
        class={styles.header}
        style={{
          backgroundColor: config.home.colors.header,
        }}
      >
        Manage Friends
      </div>
      <div class={styles.groupTabs} style={{ backgroundColor: config.home?.colors?.header }}>
        {this.tabs.map((tab, index) => (
          <div
            class={cn(styles.tab, { [styles.active]: index === this.selectedTab })}
            style={{ backgroundColor: config.home?.colors?.header, color: config.home?.colors?.accent }}
            onclick={this.tabChangeHandler.bind(this, index)}
          >
            {tab}
          </div>
        ))}
      </div>
      {this.group && (
        <div class={styles.info}>
          <div class={styles.username}>
            {this.group.totalUsers} Friend{this.group.totalUsers === 1 ? '' : 's'} in Group
          </div>
          <Button class={styles.button} outline={true} onclick={this.buttonDeleteHandler.bind(this)}>
            Delete Group
          </Button>
        </div>
      )}
      {this.friends.map((friend) => (
        <div class={styles.row}>
          <div class={styles.avatar}></div>
          <div class={styles.username}>{friend.username}</div>
          {friend.uid !== api.uid && (
            <Button class={styles.button} outline={true} onclick={this.buttonAddRemoveHandler.bind(this, friend)}>
              {this.selectedTab === 0 ? 'REMOVE' : 'ADD'}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
