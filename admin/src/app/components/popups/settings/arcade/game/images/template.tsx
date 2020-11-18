import { ImagesGameSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { ConfigFileUpload } from '../../../../../config-file-upload';

export function template(this: ImagesGameSettings) {
  let length: number;
  let first: any;
  let second: any;
  if (this.gameConfig?.images?.values) {
    const images = this.gameConfig.images.values;
    length = images.length + (images.length % 2 ? 1 : 0);
    first = images.slice(0, length / 2);
    second = images.slice(length / 2);
  }
  return (
    <div class={styles.control}>
      {this.gameConfig?.images?.values && <div class={styles.imageLabel}>IMAGE SETTINGS</div>}
      {this.gameConfig?.images?.values && (
        <div class={styles.images}>
          <div class={styles.column}>
            {first.map((item) => {
              const field = `arcade.${this.gameConfig.prefix}.${this.gameConfig.images.prefix}.${item.key}`;
              return <ConfigFileUpload title={item.label} configField={field} namespace={this.channel?.id} />;
            })}
          </div>
          <div class={styles.column}>
            {second.map((item) => {
              const field = `arcade.${this.gameConfig.prefix}.${this.gameConfig.images.prefix}.${item.key}`;
              return <ConfigFileUpload title={item.label} configField={field} namespace={this.channel?.id} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
