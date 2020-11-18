import { formatDate, IActionType, IPrizeChannelPanelAttrs, ISelectType, PrizeChannelPanel } from './index';
import styles from './module.scss';
import m from 'mithril';
import cn from 'classnames';
import { UserTable } from './user-table';
import { TargetFilter } from './target-filter';
import { numberWithCommas } from '../../../../../../../common/utils';

export function template(this: PrizeChannelPanel, { selected, onselect, onRequestChange }: IPrizeChannelPanelAttrs) {
  return (
    <div class={cn(styles.control, { [styles.selected]: selected })}>
      <div class={cn(styles.header, { [styles.dropdown]: !selected })}>
        <div class={cn(styles.arrow, { [styles.open]: selected })} onclick={() => onselect(!selected)} />
        <div class={styles.channelTitle}>
          <div class={styles.channelLabel}>{this.channel.name}</div>
          {selected && this.userTable && (
            <div class={styles.userCountLabel}>{numberWithCommas(this.userTable.totalUsers)} Users</div>
          )}
        </div>
        <div class={styles.space} />
        {selected && (
          <div class={styles.mainboard}>
            <button class={'outline'} onclick={() => this.sendMainboardLeaders()}>
              SEND TO LEADERBOARD
            </button>
          </div>
        )}
        {selected && <span>&nbsp;</span>}
        {selected && this.selectedState && (
          <div class={styles.dateTime}>
            <div class={styles.date}>{formatDate(this.selectedState.startTime).substr(0, 10)}</div>
            <div class={styles.time}>{formatDate(this.selectedState.startTime).substr(11)}</div>
          </div>
        )}
        {selected && !this.selectedState && !this.selectedDay && <div class={styles.labelOverall}>OVERALL</div>}
        {selected && this.selectedDay && (
          <div class={styles.labelOverall}>{formatDate(this.selectedDay.getTime()).substr(0, 10)}</div>
        )}
        {selected && <div class={styles.calendarBtn} onclick={this.buttonCalendarHandler.bind(this)} />}
        {selected && (this.selectedState || this.selectedDay) && (
          <div
            class={cn({ [styles.deleteBtn]: !!this.selectedState, [styles.clearBtn]: !!this.selectedDay })}
            onclick={this.buttonDeleteHandler.bind(this)}
          />
        )}
      </div>
      {selected && (
        <div class={cn(styles.main)}>
          <div class={styles.filter}>
            <div class={styles.select}>
              <select onchange={this.selectionChangeHandler.bind(this)}>
                <option selected={true}>SELECT</option>
                {!this.userTable?.allSelected() && <option value={ISelectType.SELECT_ALL}>SELECT ALL</option>}
                {this.userTable?.anySelected() && <option value={ISelectType.UNSELECT_ALL}>UNSELECT ALL</option>}
                <option value={ISelectType.SELECT_RANDOM}>SELECT RANDOM</option>
              </select>
            </div>
            <TargetFilter channel={this.channel} onchange={(value) => this.filtersChangeHandler([value])} />
            <button class={styles.advanceSearchBtn} onclick={this.advancedFilterHandler.bind(this)}>
              ADVANCED...
            </button>
            <div class={styles.space} />
            <div class={styles.actionSelect}>
              <select onchange={this.actionChangeHandler.bind(this)}>
                <option selected={true}>CHOOSE AN ACTION</option>
                <option value={IActionType.TOGGLE_USER_BAN}>{this.isBanView ? 'UNBAN USER' : 'BAN USER'}</option>
                <option value={IActionType.SEND_EMAIL}>SEND EMAIL</option>
                <option value={IActionType.SEND_SMS}>SEND SMS</option>
                <option value={IActionType.AWARD_POINTS}>AWARD POINTS</option>
              </select>
            </div>
          </div>
          <UserTable
            channel={this.channel}
            state={this.selectedState}
            day={this.selectedDay}
            banned={this.isBanView}
            onUserSelectionChanged={this.userSelectionChangedHandler.bind(this)}
            onSendSms={(u) => this.sendSmsToUser(u)}
            onSendEmail={(u) => this.sendEmailToUser(u)}
            onBanUser={(u) => this.toggleUserBan(u)}
            onRequestChange={onRequestChange}
            ref={(value) => (this.userTable = value)}
          />
        </div>
      )}
    </div>
  );
}
