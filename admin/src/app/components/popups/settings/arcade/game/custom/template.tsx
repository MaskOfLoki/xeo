import { CustomGameSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { ConfigSlide } from '../../../../../config-slide';
import { ConfigInput } from '../../../../../config-input';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';

export function template(this: CustomGameSettings) {
  const toggles: any[] = [];
  const inputs: any[] = [];
  if (this.gameConfig?.custom && this.gameConfig.custom.values) {
    this.gameConfig.custom.values.forEach((entry) => {
      // This should allow for additional field types in the future
      switch (entry.type) {
        case 'toggle':
          toggles.push(entry);
          break;
        case 'number':
        case 'string':
          inputs.push(entry);
      }
    });
  }

  return (
    <div class={styles.control}>
      {(toggles.length !== 0 || inputs.length !== 0) && <div class={styles.customLabel}>CUSTOM SETTINGS</div>}
      {toggles && (
        <div class={styles.toggles}>
          <div class={styles.column}>
            {toggles.map((item) => {
              const field = `arcade.${this.gameConfig.prefix}.${this.gameConfig.custom.prefix}.${item.key}`;
              return (
                <div class={styles.configSlider}>
                  <ConfigSlide
                    class={styles.configSlide}
                    configField={field}
                    default={item.default}
                    namespace={this.channel?.id}
                  />
                  <div class={styles.sliderLabel}>{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {inputs && (
        <div class={styles.inputs}>
          <div class={styles.column}>
            {inputs.map((item) => {
              const field = `arcade.${this.gameConfig.prefix}.${this.gameConfig.custom.prefix}.${item.key}`;
              return (
                <div class={styles.configSlider}>
                  <div class={styles.sliderLabel}>{item.label}</div>
                  <ConfigInput
                    configField={field}
                    type={item.type}
                    defaultValue={item.default}
                    namespace={this.channel?.id}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {this.gameConfig?.prefix === 'turbo-trivia-2' && <div class={styles.customLabel}>CUSTOM SETTINGS</div>}
      {this.gameConfig?.prefix === 'turbo-trivia-2' && (
        <div class={styles.triviaColumn}>
          <div class={styles.label}>Question Sets</div>
          <select class={styles.presetSelect} onchange={(e) => this.slotChangeHandler(e.target.value)}>
            {this.triviaSlots?.map((slot) => (
              <option value={slot.id} selected={slot.id == this.triviaSlot?.id}>
                {slot.name ? slot.name : 'DEFAULT'}
              </option>
            ))}
          </select>
        </div>
      )}
      {this.gameConfig?.prefix === 'turbo-trivia-2' && (
        <div class={styles.column}>
          <button class={styles.activateBtn} onclick={this.activateHandler.bind(this)}>
            {isEmptyString(this.triviaState?.sid) ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      )}
    </div>
  );
}
