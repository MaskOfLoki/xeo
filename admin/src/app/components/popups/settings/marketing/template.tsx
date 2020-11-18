import { MarketingSettings } from './index';
import styles from './module.scss';
import m from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { HomeSettingsPreview } from '../design/preview';
import cn from 'classnames';
import { TextArea } from '../../../textarea';

export function template(this: MarketingSettings) {
  return (
    <div class={styles.container}>
      <div class={styles.mainPanel}>
        <div class={styles.marketingMessageLabel}>
          <div class={styles.label}>MARKETING MESSAGE</div>
        </div>
        <div class={styles.mainContent}>
          <div class={styles.left}>
            <div class={styles.addRow}>
              <button class={cn('outline', 'disabled', styles.previewBtn)} disabled></button>
              <button
                class={cn('outline', styles.addMessageBtn)}
                onclick={this.buttonAddMessageHandler.bind(this, 'portrait')}
              >
                +
              </button>
            </div>
            {this.messages.map((message) => {
              if (message.type == 'portrait') {
                return (
                  <div class={styles.message}>
                    {isEmptyString(message.image) && (
                      <div class={styles.messageText}>
                        <TextArea class={styles.messageTextArea} value={message.text} readonly></TextArea>
                      </div>
                    )}
                    {!isEmptyString(message.image) && (
                      <div
                        class={styles.image}
                        style={{
                          backgroundImage: `url(${message.image})`,
                        }}
                      />
                    )}
                    <button class={styles.buttonEdit} onclick={this.buttonEditHandler.bind(this, message)} />
                    <button class={styles.buttonDelete} onclick={this.buttonDeleteHandler.bind(this, message)} />
                  </div>
                );
              }
            })}
          </div>
          <div class={styles.right}>
            <div class={styles.addRow}>
              <button class={cn('outline', 'disabled', styles.nonPreviewBtn)} disabled></button>
              <button
                class={cn('outline', styles.addMessageBtn)}
                onclick={this.buttonAddMessageHandler.bind(this, 'landscape')}
              >
                +
              </button>
            </div>
            {this.messages.map((message) => {
              if (message.type == 'landscape') {
                return (
                  <div class={styles.message}>
                    {isEmptyString(message.image) && (
                      <div class={styles.messageText}>
                        <TextArea class={styles.messageTextArea} value={message.text} readonly></TextArea>
                      </div>
                    )}
                    {!isEmptyString(message.image) && (
                      <div
                        class={styles.image}
                        style={{
                          backgroundImage: `url(${message.image})`,
                        }}
                      />
                    )}
                    <button class={styles.buttonEdit} onclick={this.buttonEditHandler.bind(this, message)} />
                    <button class={styles.buttonDelete} onclick={this.buttonDeleteHandler.bind(this, message)} />
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
      <div class={styles.previewPanel}>
        <HomeSettingsPreview channel={this.channel} />
      </div>
    </div>
  );
}
