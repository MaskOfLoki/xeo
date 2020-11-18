import styles from './module.scss';
import m from 'mithril';
import { EditMarketingMessagePopup } from '.';
import { TextArea } from '../../../../textarea';
import { MARKETING_MESSAGE_MAX_LENGTH } from '../../../../../../../../common/common';
import { FileUpload } from '../../../../file-upload';
import { Input } from '../../../../input';

export function template(this: EditMarketingMessagePopup) {
  return (
    <div class={styles.control}>
      <div class={styles.header}>
        <span>NEW MARKETING MESSAGE</span>
        <div class={styles.closeButton} onclick={this.close.bind(this)}></div>
      </div>
      <div class={styles.content}>
        <div class={styles.modeButtonRow}>
          <button class={this.isText ? 'selected' : 'outline'} onclick={() => (this.isText = true)}>
            TEXT
          </button>
          <button class={!this.isText ? 'selected' : 'outline'} onclick={() => (this.isText = false)}>
            IMAGE
          </button>
        </div>
        {this.isText && (
          <div class={styles.rowTextRow}>
            <TextArea
              placeholder='Message'
              maxlength={MARKETING_MESSAGE_MAX_LENGTH}
              value={this.message.text}
              oninput={(e) => (this.message.text = e.target.value)}
            />
          </div>
        )}
        {!this.isText && (
          <div class={styles.rowFileUploadRow}>
            <FileUpload value={this.message.image} onchange={(value) => (this.message.image = value)} />
          </div>
        )}
        <div class={styles.redirectURLRow}>
          <div class={styles.title}>Redirect URL</div>
          <Input value={this.message.url} oninput={(e) => (this.message.url = e.target.value)}></Input>
          <div class={styles.subTitle}>Leave blank if you don't want to use a link</div>
        </div>
        <div class={styles.clockRow}>
          <input
            class='gc-input'
            type='number'
            min='1'
            max='999'
            value={this.message.timer}
            oninput={(e) => (this.message.timer = parseInt(e.target.value))}
          />
          <div class={styles.clockIcon} />
          <div class={styles.title}>sec</div>
        </div>
        <button class={styles.saveButton} onclick={this.buttonSaveHandler.bind(this)}>
          SAVE
        </button>
      </div>
    </div>
  );
}
