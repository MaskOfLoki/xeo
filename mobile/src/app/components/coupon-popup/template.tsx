import { CouponPopup, ICouponPopupAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { Button } from '../button';
import { config } from '../../services/ConfigService';

export function template(this: CouponPopup, { coupon }: ICouponPopupAttrs) {
  return (
    <div class={styles.popup}>
      <Button onclick={this.close.bind(this)}>CLOSE</Button>
      &nbsp;
      <div
        class={cn(styles.image, {
          [styles.hasExpiration]: coupon.expiresAfter,
          [styles.hasRedemptionCode]: coupon.redemptionCode,
        })}
        style={{
          backgroundImage: `url(${coupon.image})`,
        }}
        onclick={this.onClickHandler.bind(this)}
      />
      {(coupon.expiresAfter || coupon.redemptionCode) && (
        <div
          class={styles.infoBlock}
          style={{
            backgroundColor: config.home.colors.header,
          }}
        >
          {coupon.expiresAfter && (
            <div class={styles.expiration}>
              {this.expired ? 'EXPIRED' : `EXPIRES IN ${secondsToHMS(this.timeRemaining)}`}
            </div>
          )}
          {coupon.redemptionCode && !this.expired && <div class={styles.redemptionCode}>{coupon.redemptionCode}</div>}
        </div>
      )}
    </div>
  );
}

function secondsToHMS(d: number) {
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? h + ':' : '';
  const mDisplay = m.toString().padStart(2, '0');
  const sDisplay = s.toString().padStart(2, '0');
  return hDisplay + mDisplay + sDisplay;
}
