import m from 'mithril';
import { SettingsTab, ISettingsTabAttrs } from './index';
import { Input } from '../../../../../components-next/input';
import { Slide } from '../../../../../components-next/slide';
import { ImageTooltip } from '../../../../../components-next/image-tooltip';
import { ImageUpload } from '../../../../../components-next/image-upload';
import { EMPTY_IMAGE } from '../../../../../../../../common/common';
import styles from './module.scss';

export function template(this: SettingsTab, { card }: ISettingsTabAttrs) {
  return (
    <div class={styles.settingsTab}>
      {!card.imageOnly && (
        <Input label='Headline' value={card.message} onChange={this.setAttr('message')} max={80} showRemaining />
      )}
      <div class={styles.row}>
        <div class={styles.leftCol}>
          <div class={styles.imageTitle}>
            <span>Image</span>
            <ImageTooltip />
          </div>
          <ImageUpload
            height='100px'
            image={this.image}
            onChange={() => this.openImagePickerModal(card)}
            onRemove={() => this.setImage(EMPTY_IMAGE)}
            preview
            dummy
          />
        </div>
        <div class={styles.rightCol}>
          <Slide selected={card.imageOnly} onchange={this.setAttr('imageOnly')}>
            Image only
          </Slide>
          <span>(no headline)</span>
        </div>
      </div>
      <Slide selected={card.clickable} onchange={this.setAttr('clickable')}>
        Click for Website
      </Slide>
      {card.clickable && <Input label='URL' value={card.url} onChange={this.setAttr('url')} max={100} showRemaining />}
      <Slide selected={card.socialShare} onchange={this.setAttr('socialShare')}>
        Scrolling Media
      </Slide>
      {card.socialShare && (
        <Input
          label='Social Media Message'
          value={card.socialMessage}
          onChange={this.setAttr('socialMessage')}
          max={100}
          showRemaining
        />
      )}
    </div>
  );
}
