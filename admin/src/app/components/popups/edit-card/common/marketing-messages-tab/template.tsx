import m from 'mithril';
import { MarketingMessagesTab, IMarketingMessagesTabAttrs } from './index';
import { RadioGroup } from '../../../../../components-next/radio-group';
import { Input } from '../../../../../components-next/input';
import { ImageTooltip } from '../../../../../components-next/image-tooltip';
import { ImageUpload } from '../../../../../components-next/image-upload';
import styles from './module.scss';

export function template(this: MarketingMessagesTab, { card }: IMarketingMessagesTabAttrs) {
  return (
    <div class={styles.marketingMessages}>
      <div class={styles.msgType}>
        <RadioGroup
          options={this.typeOptions}
          value={card.marketingMessage?.type || 'text'}
          onChange={(val) => this.setData('type', val)}
          horizontal
        />
      </div>
      {card.marketingMessage?.type === 'image' ? (
        <div>
          <div class={styles.imageTitle}>
            <span>Image</span>
            <ImageTooltip />
          </div>
          <ImageUpload
            height='50px'
            image={card.marketingMessage?.image}
            horizontal
            onChange={(img) => this.setData('image', img)}
            onRemove={() => this.setData('image', null)}
            preview
          />
        </div>
      ) : (
        <Input
          label='Message'
          value={card.marketingMessage?.message}
          onChange={(val) => this.setData('message', val)}
        />
      )}
      <Input label='URL' value={card.marketingMessage?.url} onChange={(val) => this.setData('url', val)} />
    </div>
  );
}
