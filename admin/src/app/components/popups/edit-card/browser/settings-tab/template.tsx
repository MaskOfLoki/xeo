import m from 'mithril';
import { SettingsTab, ISettingsTabAttrs } from './index';
import { Input } from '../../../../../components-next/input';
import { Checkbox } from '../../../../../components-next/checkbox';
import { ImageTooltip } from '../../../../../components-next/image-tooltip';
import { ImageUpload } from '../../../../../components-next/image-upload';
import styles from './module.scss';

export function template(this: SettingsTab, { card }: ISettingsTabAttrs) {
  return (
    <div class={styles.settingsTab}>
      <Input label='Headline' value={card.headline} onChange={(val) => (card.headline = val)} max={80} showRemaining />
      <Input
        label='Sub Headline (optional)'
        value={card.subheadline}
        onChange={(val) => (card.subheadline = val)}
        max={120}
        showRemaining
      />
      <div class={styles.row}>
        <div class={styles.leftCol}>
          <div class={styles.imageTitle}>
            <span>Image</span>
            <ImageTooltip />
          </div>
          <ImageUpload
            height='100px'
            image={card.image}
            onChange={(img) => (card.image = img)}
            onRemove={() => (card.image = null)}
            preview
          />
        </div>
        <div class={styles.rightCol}>
          <Checkbox
            label='Image only (no headline)'
            value={card.imageOnly}
            onChange={(val) => (card.imageOnly = val)}
          />
        </div>
      </div>
      <Input label='URL' value={card.url} onChange={(val) => (card.url = val)} max={100} showRemaining />
      <Checkbox label='Click for Website' value={card.clickable} onChange={(val) => (card.clickable = val)} />
      <Checkbox label='Scrolling Enabled' value={card.scrollEnabled} onChange={(val) => (card.scrollEnabled = val)} />
    </div>
  );
}
