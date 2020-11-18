import m from 'mithril';
import styles from './module.scss';
import { UserCouponPopup } from './index';
import { IGCCoupon } from '@gamechangerinteractive/xc-backend';

export function template(this: UserCouponPopup, coupons: IGCCoupon[]) {
  return (
    <div class={styles.popup}>
      <div class={styles.headerText}>
        <div class={styles.headerTitle}>COUPONS</div>
        <div class={styles.closeButton} onclick={() => this.close()} />
      </div>
      <div class={styles.mainContainer}>
        <div class={styles.title}>{coupons.length} COUPONS SENT</div>
        <div class={styles.couponList}>
          {coupons.map((coupon) => (
            <div class={styles.couponItem}>
              <div class={styles.couponImage} style={{ backgroundImage: `url(${coupon.image})` }} />
              <div class={styles.couponDate}>10/16/2020 03:19</div>
              <div class={styles.couponStatus}>Received</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
