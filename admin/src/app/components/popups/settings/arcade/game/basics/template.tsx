import { BasicGameSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { ConfigColorPicker } from '../../../../../config-color-picker';

export function template(this: BasicGameSettings) {
  let length: number;
  let first: any;
  let second: any;
  if (this.gameConfig?.colors && this.gameConfig.colors.values) {
    const colors = this.gameConfig.colors.values;
    length = colors.length + (colors.length % 2 ? 1 : 0);
    first = colors.slice(0, length / 2);
    second = colors.slice(length / 2);
  }

  return (
    <div class={styles.control}>
      {this.gameConfig?.colors && this.gameConfig.colors.values && <div class={styles.colorLabel}>COLORS SETTINGS</div>}
      {this.gameConfig?.colors && this.gameConfig.colors.values && (
        <div class={styles.colors}>
          <div class={styles.column}>
            {first.map((item) => {
              const field = `arcade.${this.gameConfig.prefix}.${this.gameConfig.colors.prefix}.${item.key}`;
              let defaultColor = item.default ?? '';
              let defaultValueField;
              if (!isEmptyString(defaultColor) && !defaultColor.startsWith('#')) {
                defaultValueField = defaultColor;
                defaultColor = null;
              }
              return (
                <ConfigColorPicker
                  label={item.label}
                  configField={field}
                  gradient={true}
                  defaultColor={defaultColor}
                  defaultValueField={defaultValueField}
                  namespace={this.channel?.id}
                />
              );
            })}
          </div>
          <div class={styles.column}>
            {second.map((item) => {
              const field = `arcade.${this.gameConfig.prefix}.${this.gameConfig.colors.prefix}.${item.key}`;
              let defaultColor = item.default ?? '';
              let defaultValueField;
              if (!isEmptyString(defaultColor) && !defaultColor.startsWith('#')) {
                defaultValueField = defaultColor;
                defaultColor = null;
              }

              return (
                <ConfigColorPicker
                  label={item.label}
                  configField={field}
                  gradient={true}
                  defaultColor={defaultColor}
                  defaultValueField={defaultValueField}
                  namespace={this.channel?.id}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
