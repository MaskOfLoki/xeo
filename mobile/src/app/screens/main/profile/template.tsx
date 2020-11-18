import m from 'mithril';

import { ProfileScreen } from './index';
import styles from './module.scss';
import cn from 'classnames';
import { config } from '../../../services/ConfigService';
import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';

export function template(this: ProfileScreen) {
  return (
    <div class={cn(styles.profile, { [styles.hasChannelVideo]: this.hasChannelVideo })}>
      <div
        class={styles.header}
        style={{
          backgroundColor: config.home.colors.header,
        }}
      >
        Profile
      </div>
      <div class={styles.container}>
        <div class={styles.userInfo}>
          <Avatar />
          <div class={styles.column}>
            <div>{this.user.username}</div>
            <div>{this.user.email}</div>
          </div>
          <Button onclick={() => m.route.set('/profile/edit')}>Edit Profile</Button>
        </div>
        <br />
        <div class={styles.title}>FRIENDS</div>
        {!this.loaded && <div class={styles.label}>Loading...</div>}
        {this.loaded && (
          <div class={styles.label}>
            You are in a group with {this.friends} Friend{this.friends === 1 ? '' : 's'}
          </div>
        )}
        {this.loaded && (!this.friendsGroup || this.friendsGroup?.host?.uid === this.user.uid) && (
          <div class={styles.groupButtons}>
            <Button onclick={this.buttonInviteFriendsHandler.bind(this)}>Invite Friends</Button>
            {this.friendsGroup && (
              <Button outline={true} onclick={() => m.route.set('/profile/manage-friends')}>
                Manage Friends
              </Button>
            )}
          </div>
        )}
        {this.loaded && this.friendsGroup && this.friendsGroup.host.uid !== this.user.uid && (
          <div class={styles.groupButtons}>
            <Button onclick={this.buttonLeaveFriendsGroupHandler.bind(this)}>Leave Group</Button>
          </div>
        )}
        <div class={styles.teams}>
          <div class={styles.title}>TEAMS</div>
          <div class={styles.status}>
            {this.teamName ? `You are in Team "${this.teamName}".` : 'You are not currently in a Team.'}
          </div>
          <Button onclick={() => this.onJoinTeam()}>{this.teamName ? 'Change Teams' : 'Join a Team'}</Button>
        </div>
      </div>
    </div>
  );
}
