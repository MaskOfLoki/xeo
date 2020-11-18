import m from 'mithril';
import { DesignTab, IDesignTabAttrs } from './index';
import { Select, ISelectOption } from '../../../../../components-next/select';
import { Button } from '../../../../../components-next/button';
import { IconButton } from '../../../../../components-next/icon-button';
import { ImageTooltip } from '../../../../../components-next/image-tooltip';
import { ImageUpload } from '../../../../../components-next/image-upload';
import { PresetsSelect } from '../../../../../components-next/presets-select';
import { ColorPicker } from '../../../../color-picker';
import styles from './module.scss';
import { EMPTY_IMAGE } from '../../../../../../../../common/common';

export function template(this: DesignTab, { card, onChange }: IDesignTabAttrs) {
  return (
    <div class={styles.designTab}>
      <PresetsSelect
        type={`design-card-${card.type}`}
        data={this.presetData}
        onchange={(data) => this.updateFromPreset(data)}
      />
      <div class={styles.tableRow}>
        <div className={styles.nameCol}></div>
        <div className={styles.colorCol}>Color</div>
        <div className={styles.imageCol}>Image</div>
      </div>
      <div class={styles.tableRow}>
        <div className={styles.nameCol}>Background</div>
        <div className={styles.colorCol}>
          <ColorPicker color={card.colors?.background} onchange={(val) => this.setColor('background', val)} gradient />
        </div>
        <div className={styles.imageCol}>
          <ImageTooltip overlayOffsetX='-1.5rem' overlayOffsetY='1.5rem' />
          <ImageUpload
            className={!card.images?.background ? styles.alignLeft : ''}
            image={this.backgroundImage}
            onChange={() => this.openImagePickerModal('background', card)}
            onRemove={() => this.setImage('background', EMPTY_IMAGE)}
            showBorder={false}
            height='100%'
            horizontal
            dummy
          />
        </div>
      </div>
      <div class={styles.tableRow}>
        <div className={styles.nameCol}>Text</div>
        <div className={styles.colorCol}>
          <ColorPicker color={card.colors?.text} onchange={(val) => this.setColor('text', val)} />
        </div>
        <div className={styles.imageCol}></div>
      </div>
      <div class={styles.tableRow}>
        <div className={styles.nameCol}>Divider Line</div>
        <div className={styles.colorCol}>
          <ColorPicker color={card.colors?.divider} onchange={(val) => this.setColor('divider', val)} gradient />
        </div>
        <div className={styles.imageCol}>
          <ImageTooltip overlayOffsetX='-1.5rem' overlayOffsetY='1.5rem' />
          <ImageUpload
            className={!card.images?.divider ? styles.alignLeft : ''}
            image={this.dividerImage}
            onChange={() => this.openImagePickerModal('divider', card)}
            onRemove={() => this.setImage('divider', EMPTY_IMAGE)}
            showBorder={false}
            height='100%'
            horizontal
            dummy
          />
        </div>
      </div>
    </div>
  );
}
