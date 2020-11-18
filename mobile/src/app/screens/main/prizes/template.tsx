import { PrizesScreen } from './index';
import m from 'mithril';
import styles from './module.scss';
import { getColor } from '../../../../../../common/utils';
import { config } from '../../../services/ConfigService';
import { Button } from '../../../components/button';

export function template(this: PrizesScreen) {
  return (
    <div class={styles.screen}>
      <div
        class={styles.title}
        style={{
          background: getTitleBackground(),
        }}
      >
        Prizes
      </div>

      <div class={styles.parentcup}>
        <div class={styles.prizecup} />

        {this.coupons.length === 0 && (
          <div class={styles.noPrizeText}>
            You haven’t won any prizes yet. <br />
            Keep collecting points for a chance to win!
          </div>
        )}

        {this.coupons.map((coupon) => (
          <div
            class={styles.coupon}
            style={{
              backgroundImage: `url(${coupon.image})`,
            }}
            onclick={this.couponHandler.bind(this, coupon)}
          ></div>
        ))}

        <Button class={styles.homebutton} onclick={this.goToHome.bind(this)} />
      </div>
    </div>
  );
}

function getTitleBackground() {
  return `linear-gradient(to right, ${getColor(config.home.colors.secondary.background)}, ${getColor(
    config.home.colors.secondary.foreground,
  )})`;
}
