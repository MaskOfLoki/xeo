import { UserCount, IUserCountAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { Slide } from '../../../../components/slide';
import { CountUp } from '../../../../../../../common/utils/CountUp';

export function template(this: UserCount, { channel, onsave }: IUserCountAttrs) {
  return (
    <div class={styles.control}>
      <Slide
        selected={channel.showUserCount}
        onchange={(value) => {
          channel.showUserCount = value;
          onsave(channel);
        }}
      >
        User Count
      </Slide>
      {channel.showUserCount && this.userCount != null && (
        <CountUp value={this.userCount}>
          <div class={styles.userCountValue}></div>
        </CountUp>
      )}
    </div>
  );
}
