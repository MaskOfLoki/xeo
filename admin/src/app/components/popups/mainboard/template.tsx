import { MainboardSettingsPopup, MAINBOARD_LAYOUT_ZONE_LIST, MAINBOARD_ZONE_STRING } from './index';
import styles from './module.scss';
import m from 'mithril';
import { LayoutItem } from './layout-item';
import {
  MainboardLayout,
  MainboardZone,
  IMainboardLayoutItem,
  DEFAULT_MAINBOARD_CONFIG,
  MainboardPreviewMode,
} from '../../../../../../common/common';
import { ConfigFileUpload } from '../../config-file-upload';
import { MAINBOARD_CONFIG_FIELDS } from '../../../../../../common/constants/mainboard';
import { ConfigColorPicker } from '../../config-color-picker';
import { MainboardPreview } from '../../mainboard-preview';

export function template(this: MainboardSettingsPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.header}>
        <div class={styles.left}>
          <div class={styles.subTitle}>{this.channel ? `${this.channel.name} ` : ''}Mainboard Configuration</div>
        </div>
        <div class={styles.right}>
          <div class={styles.closeButton} onclick={this.close.bind(this)}></div>
        </div>
      </div>
      <div class={styles.content}>
        <div class={styles.left}>
          <div class={styles.layoutSettingWrapper}>
            <div class={styles.layoutSelectWrapper}>
              <button
                class={this.layout === MainboardLayout.FULLSCREEN ? 'active' : 'outline'}
                onclick={() => this.layoutSelectHandler(MainboardLayout.FULLSCREEN)}
              >
                FULLSCREEN
              </button>
              <button
                class={this.layout === MainboardLayout.SIDESLAB ? 'active' : 'outline'}
                onclick={() => this.layoutSelectHandler(MainboardLayout.SIDESLAB)}
              >
                SIDE SLAB
              </button>
              <button
                class={this.layout === MainboardLayout.LOWER_THIRD ? 'active' : 'outline'}
                onclick={() => this.layoutSelectHandler(MainboardLayout.LOWER_THIRD)}
              >
                LOWERTHIRD
              </button>
            </div>
            <div class={styles.zoneSelectWrapper}>
              {MAINBOARD_LAYOUT_ZONE_LIST[this.layout].map((zoneItem: MainboardZone) => (
                <button
                  class={this.zone === zoneItem ? 'active' : 'outline'}
                  onclick={() => this.zoneSelectHandler(zoneItem)}
                >
                  {MAINBOARD_ZONE_STRING[zoneItem]}
                </button>
              ))}
            </div>
            <div class={styles.designSettingWrapper}>
              <div class={styles.row}>
                <div class={styles.designTitle}>Design</div>
              </div>
              <div class={styles.row}>
                <div class={styles.rowText}>Background Image</div>
                <div class={styles.image}>
                  <ConfigFileUpload
                    configField={'mainboard.images.' + [this.layout]}
                    namespace={`${this.channel?.id}mainboard`}
                  />
                </div>
              </div>
              <div class={styles.row}>
                <div class={styles.rowText}>Background video</div>
                <div class={styles.image}>
                  <ConfigFileUpload
                    configField={'mainboard.videos.' + [this.layout]}
                    namespace={`${this.channel?.id}mainboard`}
                    type='video'
                  />
                </div>
              </div>
            </div>
          </div>
          <div class={styles.layoutPreviewWrapper}>
            <div class={styles.previewPane}>
              {MAINBOARD_CONFIG_FIELDS[this.layout][this.zone]?.items?.map((item: IMainboardLayoutItem) => {
                return (
                  <div
                    class={styles.previewItem}
                    style={{
                      width: item.width + '%',
                      height: item.height + '%',
                      left: item.left + '%',
                      top: item.top + '%',
                    }}
                  >
                    <LayoutItem
                      item={item}
                      layout={this.layout}
                      zone={this.zone}
                      namespace={`${this.channel?.id || ''}mainboard`}
                    ></LayoutItem>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div class={styles.right}>
          <div class={styles.colorsWrapper}>
            <div class={styles.row}>
              <div class={styles.designTitle}>COLORS</div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Background</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='mainboard.colors.background'
                  defaultColor={DEFAULT_MAINBOARD_CONFIG.mainboard.colors.background}
                  gradient={true}
                  namespace={`${this.channel.id || ''}mainboard`}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Accent Line</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='mainboard.colors.accent'
                  defaultColor={DEFAULT_MAINBOARD_CONFIG.mainboard.colors.accent}
                  gradient={true}
                  namespace={`${this.channel.id || ''}mainboard`}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Live Responses</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='mainboard.colors.liveResponse'
                  defaultColor={DEFAULT_MAINBOARD_CONFIG.mainboard.colors.liveResponse}
                  gradient={true}
                  namespace={`${this.channel.id || ''}mainboard`}
                />
              </div>
            </div>
            <div class={styles.row}>
              <div class={styles.rowText}>Chroma Key</div>
              <div class={styles.color}>
                <ConfigColorPicker
                  configField='mainboard.colors.chromaKey'
                  defaultColor={DEFAULT_MAINBOARD_CONFIG.mainboard.colors.chromaKey}
                  gradient={true}
                  namespace={`${this.channel.id || ''}mainboard`}
                />
              </div>
            </div>
          </div>
          <div class={styles.mainboardPreviewWrapper}>
            <MainboardPreview
              ref={this.mainboardPreviewReadyHandler.bind(this)}
              class={styles.mainboardPreview}
              channelId={this.channel?.id}
              mode={MainboardPreviewMode.SETTING}
            ></MainboardPreview>
          </div>
        </div>
      </div>
    </div>
  );
}
