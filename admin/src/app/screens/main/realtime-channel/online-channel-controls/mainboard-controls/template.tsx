import { MainboardControls } from './index';
import styles from './module.scss';
import m from 'mithril';
import { MainboardLayout, MainboardDisplay, MainboardZone } from '../../../../../../../../common/common';
import cn from 'classnames';
import { MAINBOARD_ZONE_STRING } from '../../../../../components/popups/mainboard';

export function template(this: MainboardControls) {
  return (
    <div class={styles.control}>
      <div class={styles.layoutColumn}>
        <div class={styles.layoutRow}>
          <div
            class={cn(styles.layout, { [styles.outline]: this.layout !== MainboardLayout.FULLSCREEN })}
            onclick={this.mainboardLayoutChangeHandler.bind(this, MainboardLayout.FULLSCREEN)}
          >
            <div>FULLSCREEN</div>
          </div>
          <div
            class={cn(styles.layout, { [styles.outline]: this.layout !== MainboardLayout.SIDESLAB })}
            onclick={this.mainboardLayoutChangeHandler.bind(this, MainboardLayout.SIDESLAB)}
          >
            <div class={styles.sidmessage}>SIDE SLAB</div>
            <div class={styles.side_slab} />
          </div>
          <div
            class={cn(styles.layout, { [styles.outline]: this.layout !== MainboardLayout.LOWER_THIRD })}
            onclick={this.mainboardLayoutChangeHandler.bind(this, MainboardLayout.LOWER_THIRD)}
          >
            <div class={styles.message}>LOWER THIRD</div>
            <div class={styles.lower_third} />
          </div>
        </div>
        <div class={styles.zoneRow}>
          <div class={styles.zone}>
            <select
              onchange={(e) => this.mainboardZoneChangeHandler(e.target.value)}
              disabled={this.layout !== MainboardLayout.FULLSCREEN || this.display === MainboardDisplay.LEADERBOARD}
            >
              {[MainboardZone.FULLSCREEN_ZONE5, MainboardZone.FULLSCREEN_ZONE4].map((zone) => (
                <option selected={this.fullscreenZone == zone} value={zone}>
                  {MAINBOARD_ZONE_STRING[zone]}
                </option>
              ))}
            </select>
          </div>
          <div class={styles.zone}>
            <select
              onchange={(e) => this.mainboardZoneChangeHandler(e.target.value)}
              disabled={this.layout !== MainboardLayout.SIDESLAB || this.display === MainboardDisplay.LEADERBOARD}
            >
              {[MainboardZone.SIDESLAB_ZONE3, MainboardZone.SIDESLAB_ZONE2].map((zone) => (
                <option selected={this.sideslabZone == zone} value={zone}>
                  {MAINBOARD_ZONE_STRING[zone]}
                </option>
              ))}
            </select>
          </div>
          <div class={styles.zone}>
            <select
              onchange={(e) => this.mainboardZoneChangeHandler(e.target.value)}
              disabled={this.layout !== MainboardLayout.LOWER_THIRD || this.display === MainboardDisplay.LEADERBOARD}
            >
              {[MainboardZone.LOWER_THIRD_ZONE3, MainboardZone.LOWER_THIRD_ZONE2].map((zone) => (
                <option selected={this.lowerThirdZone == zone} value={zone}>
                  {MAINBOARD_ZONE_STRING[zone]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div class={styles.buttonColumn}>
        <button
          class={cn({ outline: this.display === MainboardDisplay.LEADERBOARD })}
          onclick={() => this.buttonDisplayHandler()}
        >
          CARD
        </button>
        <button
          class={cn({ outline: this.display !== MainboardDisplay.LEADERBOARD })}
          onclick={() => this.buttonDisplayHandler(MainboardDisplay.LEADERBOARD)}
        >
          LEADERBOARD
        </button>
        <button class={cn({ outline: !this.mobileLeaderboard })} onclick={() => this.toggleMobileLeaderboard()}>
          MOBILE LEADERBOARD
        </button>
      </div>
    </div>
  );
}
