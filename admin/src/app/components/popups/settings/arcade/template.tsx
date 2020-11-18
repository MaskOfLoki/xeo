import { ArcadeSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { ArcadeVerticalTabBar } from './arcade-vertical-tab-bar';
import { IChannel } from '../../../../../../../common/common';
import { ConfigFileUpload } from '../../../config-file-upload';
import { ConfigSlide } from '../../../config-slide';
import { GameSettingsPreview } from './game/preview';
import { MAX_HEADER } from '../../../../utils';
import cn from 'classnames';
import { ConfigInput } from '../../../config-input';
import { ConfigRadioToggle } from '../../../config-toggle';

export function template(this: ArcadeSettings, channel: IChannel) {
  return (
    <div class={styles.container}>
      <div class={styles.leftSide}>
        <button
          class={cn(styles.preferencesButton, { [styles.selected]: this.preferencesShown })}
          onclick={this.showPreferences.bind(this)}
        >
          Preferences
        </button>
        <ArcadeVerticalTabBar
          label='GAMES'
          tabs={this.tabs}
          channel={channel}
          selected={this.selectedTab}
          onchange={this.onTabSelect.bind(this)}
        />
      </div>
      {this.preferencesShown && (
        <div class={styles.content}>
          <div class={styles.preferences}>
            <div class={styles.preferenceControls}>
              <div class={styles.header}>PREFERENCES</div>
              <div class={styles.image}>
                <div class={styles.imageLabel}>Background</div>
                <ConfigFileUpload configField='arcade.background.portrait' namespace={channel?.id} />
              </div>
              <div class={styles.image}>
                <div class={styles.imageLabel}>Logo</div>
                <ConfigFileUpload configField='arcade.logo' namespace={channel?.id} />
              </div>
              <div class={styles.input}>
                <div class={styles.inputLabel}>Title</div>
                <div class={styles.inputBox}>
                  <ConfigInput
                    placeholder='Title'
                    maxlength={MAX_HEADER}
                    configField='arcade.title'
                    namespace={channel?.id}
                    defaultValue=''
                  />
                </div>
              </div>
              <div class={styles.input}>
                <div class={styles.inputLabel}>Custom Message</div>
                <div class={styles.inputBox}>
                  <ConfigInput
                    placeholder='Custom Message'
                    maxlength={MAX_HEADER}
                    configField='arcade.customMessage'
                    namespace={channel?.id}
                    defaultValue=''
                  />
                </div>
              </div>
              <div class={styles.divideLine}></div>

              <div class={styles.mainLabel}>LAYOUT DEFAULTS</div>
              <div class={styles.defaultLayoutContainer}>
                <div class={styles.configSlider}>
                  <ConfigRadioToggle
                    class={styles.configSlide}
                    value='list'
                    configField='arcade.defaultLayout'
                    namespace={channel?.id}
                  />
                  <div class={styles.sliderLabel}>List</div>
                </div>
                <div class={styles.configSlider}>
                  <ConfigRadioToggle
                    class={styles.configSlide}
                    value='tile'
                    configField='arcade.defaultLayout'
                    namespace={channel?.id}
                  />
                  <div class={styles.sliderLabel}>Tile</div>
                </div>
              </div>

              <div class={styles.enableGameToggles}>
                {this.games &&
                  this.games.map((game) => {
                    return (
                      <div class={styles.gameEnableToggle}>
                        <div class={styles.gameIcon}></div>
                        <div class={styles.gameName}>{game.name}</div>
                        <div class={styles.toggleLabel}>Enable Game</div>
                        <div class={styles.inputWrapper}>
                          <ConfigSlide configField={`arcade.enable-${game.id}`} namespace={channel?.id} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div class={styles.previewPanel}>
              <GameSettingsPreview channel={channel} />
            </div>
          </div>
        </div>
      )}
      {this.selectedTab && (
        <div class={styles.content}>
          {m(this.selectedTab.component, {
            name: this.selectedTab.label,
            gid: this.selectedTab.gid,
            premium: this.selectedTab.premium,
            channel,
          })}
        </div>
      )}
    </div>
  );
}
