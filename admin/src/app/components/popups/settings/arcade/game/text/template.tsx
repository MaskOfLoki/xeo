import { TextGameSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { ConfigInput } from '../../../../../config-input';

export function template(this: TextGameSettings) {
  let fieldPrefix = '';
  const inputs: any[] = [];
  if (this.gameConfig?.text && this.gameConfig.text.values) {
    fieldPrefix = `arcade.${this.gameConfig.prefix}.${this.gameConfig.text.prefix}`;
    this.gameConfig.text.values.forEach((entry) => {
      inputs.push(entry);
    });
  }
  return (
    <div class={styles.control}>
      {this.gameConfig?.text?.values && <div class={styles.textLabel}>TEXT SETTINGS</div>}
      {this.gameConfig?.text?.values && (
        <div class={styles.textFields}>
          <div class={styles.column}>
            {inputs.map((item) => {
              return (
                <div class={styles.configSlider}>
                  <div class={styles.sliderLabel}>{item.label}</div>
                  <ConfigInput
                    title={item.label}
                    configField={`${fieldPrefix}.${item.key}`}
                    maxlength={item.limit ?? null}
                    default={item.default}
                    namespace={this.channel?.id}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
