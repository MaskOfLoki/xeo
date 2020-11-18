import { PAGE_OFFSET, PAGE_SIZE, UserTable } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { numberWithCommas } from '../../../../../../../../common/utils';
import { ContextMenu } from '../../../../context-menu';

export function template(this: UserTable) {
  const menuItems = [
    {
      title: 'Send SMS',
      fn: this.sendSms.bind(this),
    },
    {
      title: 'Send Email',
      fn: this.sendEmail.bind(this),
    },
    {
      title: `${this.bannedOnly ? 'Unban' : 'Ban'} User`,
      fn: this.banUser.bind(this),
    },
  ];

  return (
    <div class={styles.control}>
      <div class={styles.list}>
        <div class={styles.listHeader}>
          <div class={styles.checkCol} />
          <div class={styles.userNameCol}>USERNAME</div>
          <div class={styles.emailCol}>EMAIL</div>
          <div class={styles.phoneCol}>PHONE NUMBER</div>
          <div class={styles.scoreCol}>SCORE</div>
          <div class={styles.statusCol}>STATUS</div>
        </div>
        <div class={styles.listMain}>
          {this.users.map((user) => (
            <ContextMenu items={menuItems}>
              <div class={styles.listItem} oncontextmenu={this.userRightClickSelected.bind(this, user)}>
                <div class={styles.checkCol}>
                  <div
                    class={cn(styles.actionCheckBtn, { [styles.selected]: this.selected.includes(user) })}
                    onclick={this.selectHandler.bind(this, user)}
                  >
                    <div class={styles.checkIcon} />
                  </div>
                </div>
                <div class={styles.userNameCol}>{user.username}</div>
                <div class={styles.emailCol}>{user.email}</div>
                <div class={styles.phoneCol}>{user.phone}</div>
                <div class={styles.scoreCol}>{user.points}</div>
                <div class={styles.statusCol}>
                  {user.couponStatuses}
                  <div class={styles.editBtn} onclick={this.showUserCoupons.bind(this, user.uid)} />
                </div>
              </div>
            </ContextMenu>
          ))}
        </div>
      </div>
      <div class={styles.pagination}>
        <div class={styles.paginationInfo}>
          1 - {Math.min(PAGE_SIZE, this.totalUsers)} OF {numberWithCommas(this.totalUsers)}
        </div>
        {this.totalPages > 1 && (
          <div class={styles.paginationBtnList}>
            <div
              class={cn(styles.leftArrowBtn, { [styles.disable]: this.currentStartPage <= 1 })}
              onclick={this.goPreviousOffsetPage.bind(this)}
            >
              &lt;
            </div>
            {range(
              this.currentStartPage,
              this.currentStartPage + PAGE_OFFSET >= this.totalPages
                ? this.totalPages - 1
                : this.currentStartPage + PAGE_OFFSET,
            ).map((item) => (
              <button
                class={cn(styles.pageNoBtn, item === this.currentPage ? 'selected' : 'outline')}
                onclick={this.goToPageHandler.bind(this, item)}
              >
                {item + 1}
              </button>
            ))}
            {this.currentStartPage + PAGE_OFFSET <= this.totalPages && (
              <button class={cn(styles.pageNoBtn, { [styles.threeDots]: true })}>...</button>
            )}
            {this.currentStartPage + PAGE_OFFSET <= this.totalPages && (
              <button
                class={cn(styles.pageNoBtn, this.totalPages - 1 === this.currentPage ? 'selected' : 'outline')}
                onclick={this.goToPageHandler.bind(this, this.totalPages - 1)}
              >
                {this.totalPages}
              </button>
            )}
            <div
              class={cn(styles.rightArrowBtn, {
                [styles.disable]: this.currentStartPage + PAGE_OFFSET >= this.totalPages,
              })}
              onclick={this.goNextOffsetPage.bind(this)}
            >
              &gt;
            </div>
          </div>
        )}
        <div class={styles.selectedText}>{this.selected.length} SELECTED</div>
      </div>
    </div>
  );
}

function range(start: number, end: number): Array<number> {
  const list = [];
  for (let i = start; i <= end; i++) {
    list.push(i);
  }

  return list;
}
