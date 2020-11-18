import { CouponPanel, ICouponPanelAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { ContextMenu } from '../../../context-menu';

export function template(this: CouponPanel, { onawardeveryone, onawardselected }: ICouponPanelAttrs) {
  const menuItems = [
    {
      title: 'EDIT',
      fn: this.onCouponEdit.bind(this),
    },
    {
      title: 'DELETE',
      fn: this.onCouponDelete.bind(this),
    },
  ];

  return (
    <div class={styles.control}>
      <div class={styles.header}>
        <div class={styles.couponLabel}>COUPONS</div>
        <div class={styles.couponAddBtn} onclick={this.couponAddHandler.bind(this)}>
          +
        </div>
        <div class={styles.space} />
        <div class={styles.couponSetDropDown}>
          <div class={styles.couponSetAddBtn} onclick={this.couponSetAddHandler.bind(this)}>
            +
          </div>
          {this.selectedCouponSet?.name !== 'DEFAULT' && (
            <div class={styles.couponSetEditBtn} onclick={this.couponSetEditHandler.bind(this)} />
          )}
          <select
            class={styles.couponSetSelect}
            onchange={(e) => {
              this.onCouponSetChange(this.couponSets.find((set) => set.id === e.target.value));
            }}
          >
            {this.couponSets.map((couponSet) => (
              <option selected={this.selectedCouponSet?.id === couponSet.id} value={couponSet.id}>
                {couponSet.name}
              </option>
            ))}
          </select>
          {this.selectedCouponSet?.name !== 'DEFAULT' && this.couponSets.length > 1 && (
            <div class={styles.couponSetDeleteBtn} onclick={this.couponSetDeleteHandler.bind(this)} />
          )}
        </div>
      </div>
      <div class={styles.couponList}>
        {this.coupons
          .filter((c) => c.couponSetId === this.selectedCouponSet?.id)
          .map((coupon) => (
            <ContextMenu items={menuItems}>
              <div
                class={cn(styles.couponItem, { [styles.selected]: this.selectedCoupon === coupon })}
                style={{
                  backgroundImage: `url(${coupon.image})`,
                }}
                onclick={this.couponSelectedHandler.bind(this, coupon)}
                oncontextmenu={this.couponSelectedHandler.bind(this, coupon)}
              />
            </ContextMenu>
          ))}
      </div>

      <div class={styles.footer}>
        <button class='outline' disabled={!this.selectedCoupon} onclick={() => onawardselected(this.selectedCoupon)}>
          AWARD SELECTED USERS
        </button>
        <button class='outline' disabled={!this.selectedCoupon} onclick={() => onawardeveryone(this.selectedCoupon)}>
          AWARD EVERYONE
        </button>
      </div>
    </div>
  );
}
