import m from 'mithril';
import styles from './module.scss';
import { EditCouponPopup } from './index';
import { Input } from '../../../../../input';
import { FileUpload } from '../../../../../file-upload';
import cn from 'classnames';
import { MAX_COUPON_NAME, MAX_COUPON_REDEMPTION_DAYS } from '../../../../../../utils';

export function template(this: EditCouponPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.headerText}>
        <div class={styles.headerTitle}>ADD COUPON</div>
        <div class={styles.space} />
        <div class={styles.closeButton} onclick={() => this.close()} />
      </div>
      <div class={styles.mainContainer}>
        <div class={styles.left}>
          <div class={styles.couponNameInputWrapper}>
            <div class={styles.label}>Coupon Name</div>
            <Input
              maxlength={MAX_COUPON_NAME}
              value={this.coupon.name}
              oninput={(e) => (this.coupon.name = e.target.value)}
              placeholder='Coupon Name'
            />
          </div>
          <div class={styles.uploadImgWrapper}>
            <FileUpload
              value={this.coupon.image}
              onchange={(value) => {
                this.coupon.image = value;
              }}
            />
            <div class={styles.label}>UPLOAD IMAGE</div>
            <div class={styles.subLabel}>00 x 00 pixels</div>
          </div>
        </div>
        <div class={styles.center}>
          <div class={styles.toggleRow}>
            <div
              class={cn(styles.toggle, { [styles.selected]: this.isRedemptionTimeLimit })}
              onclick={() => (this.isRedemptionTimeLimit = !this.isRedemptionTimeLimit)}
            >
              <div class={styles.checkIcon} />
            </div>
            <div class={styles.label}>Redemption Time Limit</div>
          </div>
          <div class={cn(styles.redemptionTimeInputRow, { [styles.disable]: !this.isRedemptionTimeLimit })}>
            <div class={styles.dayInput}>
              <div class={styles.label}>Days</div>
              <Input
                value={this.redemptionDays}
                min={0}
                max={MAX_COUPON_REDEMPTION_DAYS}
                type='number'
                oninput={(e) => (this.redemptionDays = +e.target.value)}
              />
            </div>
            <div class={styles.hoursInput}>
              <div class={styles.label}>Hours</div>
              <Input
                value={this.redemptionHours}
                min={0}
                max={23}
                type='number'
                oninput={(e) => (this.redemptionHours = +e.target.value)}
              />
            </div>
            <div class={styles.minutesInput}>
              <div class={styles.label}>Minutes</div>
              <Input
                value={this.redemptionMinutes}
                min={0}
                max={59}
                type='number'
                oninput={(e) => (this.redemptionMinutes = +e.target.value)}
              />
            </div>
          </div>
          <div class={styles.toggleRow}>
            <div
              class={cn(styles.toggle, { [styles.selected]: this.isPrizeLink })}
              onclick={() => (this.isPrizeLink = !this.isPrizeLink)}
            >
              <div class={styles.checkIcon} />
            </div>
            <div class={styles.label}>Prize Link</div>
          </div>
          <div class={cn(styles.prizeLinkInputRow, { [styles.disable]: !this.isPrizeLink })}>
            <div class={styles.label}>Prize URL</div>
            <Input
              placeholder='www.prizeurl.com/prize'
              value={this.coupon.redirectUrl}
              oninput={(e) => (this.coupon.redirectUrl = e.target.value)}
            />
          </div>
        </div>
        <div class={styles.right}>
          <div class={styles.toggleRow}>
            <div
              class={cn(styles.toggle, { [styles.selected]: this.coupon.textNotificationEnabled })}
              onclick={() => (this.coupon.textNotificationEnabled = !this.coupon.textNotificationEnabled)}
            >
              <div class={styles.checkIcon} />
            </div>
            <div class={styles.label}>Text Message Notification</div>
          </div>
          <div
            class={cn(styles.messageNotificationInputRow, { [styles.disable]: !this.coupon.textNotificationEnabled })}
          >
            <div class={styles.label}>Text Message</div>
            <Input
              placeholder='Text Message'
              value={this.coupon.textNotificationMessage}
              oninput={(e) => (this.coupon.textNotificationMessage = e.target.value)}
            />
          </div>
          <div class={styles.toggleCustomRedeptionRow}>
            <div
              class={cn(styles.toggle, { [styles.selected]: this.isCustomRedemptionCode })}
              onclick={() => (this.isCustomRedemptionCode = !this.isCustomRedemptionCode)}
            >
              <div class={styles.checkIcon} />
            </div>
            <div class={styles.label}>Custom Redemption Code</div>
          </div>
          <div class={cn(styles.codeLettersInputRow, { [styles.disable]: !this.isCustomRedemptionCode })}>
            <div class={styles.label}>Code Letters (first 3 letters)</div>
            <Input
              value={this.coupon.redemptionCodeData?.prefix}
              oninput={(e) => (this.ensureRedemptionCodeData.prefix = e.target.value)}
            />
          </div>
          <div class={cn(styles.codeLengthInputRow, { [styles.disable]: !this.isCustomRedemptionCode })}>
            <div class={styles.label}>Code Length (amount of numbers)</div>
            <Input
              value={this.coupon.redemptionCodeData?.length}
              min={0}
              max={20}
              type='number'
              oninput={(e) => (this.ensureRedemptionCodeData.length = e.target.value)}
            />
          </div>
        </div>
      </div>
      <div class={styles.controls}>
        <button class={styles.cancel} onclick={this.close.bind(this, undefined)}>
          CANCEL
        </button>
        <button class={styles.confirm} onclick={this.buttonConfirmHandler.bind(this)}>
          SAVE COUPON
        </button>
      </div>
    </div>
  );
}
