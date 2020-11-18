import { RealTimeSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';
import { ConfigSlide } from '../../../../config-slide';

export function template(this: RealTimeSettings, { channel }: IChannelStateAttrs) {
  return (
    <div class={styles.container}>
      <div class={styles.title}>MISC</div>
      {!channel && (
        <div class={styles.configSlider}>
          <div class={styles.sliderLabel}>
            Limit to Real-Time Mode ONLY
            <br />
            (Program Mode still in development)
          </div>
          <ConfigSlide class={styles.configSlide} configField='misc.isonlyrealtime'></ConfigSlide>
        </div>
      )}
      {!channel && (
        <div class={styles.configSlider}>
          <div class={styles.sliderLabel}>
            Disable Real-Time Action Board
            <br />
            (Real-Time Action Board still in development)
          </div>
          <ConfigSlide class={styles.configSlide} configField='misc.disableactionboard'></ConfigSlide>
        </div>
      )}
      <div class={styles.groupButtons}>
        <button onclick={this.buttonExportSettingsHandler.bind(this)}>EXPORT SETTINGS</button>
        <button onclick={this.buttonImportSettingsHandler.bind(this)}>IMPORT SETTINGS</button>
      </div>
    </div>
  );
}
