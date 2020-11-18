import m from 'mithril';
import { SettingsTab, ISettingsTabAttrs } from './index';
import { Input } from '../../../../../components-next/input';
import { ImageTooltip } from '../../../../../components-next/image-tooltip';
import { ImageUpload } from '../../../../../components-next/image-upload';
import { EMPTY_IMAGE } from '../../../../../../../../common/common';
import styles from './module.scss';

export function template(this: SettingsTab, { card }: ISettingsTabAttrs) {
  return (
    <div class={styles.settingsTab}>
      <Input label='Headline' value={card.header} onChange={(val) => (card.header = val)} max={20} showRemaining />
      <Input
        label='Sub Headline (optional)'
        value={card.message}
        onChange={(val) => (card.message = val)}
        max={30}
        showRemaining
      />
      <div class={styles.row}>
        <div class={styles.leftCol}>
          <div class={styles.imageTitle}>
            <span>Thumbs Up</span>
            <ImageTooltip />
          </div>
          <ImageUpload
            height='6.25rem'
            image={this.upImage}
            onChange={() => this.openImagePickerModal('up', card)}
            onRemove={() => this.setImage('up', EMPTY_IMAGE)}
            preview
            dummy
          />
        </div>
        <div class={styles.rightCol}>
          <div class={styles.imageTitle}>
            <span>Thumbs Down</span>
            <ImageTooltip />
          </div>
          <ImageUpload
            height='6.25rem'
            image={this.downImage}
            onChange={() => this.openImagePickerModal('down', card)}
            onRemove={() => this.setImage('down', EMPTY_IMAGE)}
            preview
            dummy
          />
        </div>
      </div>
    </div>
  );
}
