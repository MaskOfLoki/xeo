import m from 'mithril';
import styles from './module.scss';
import { EditCardPopup, IEditCardAttrs } from './index';
import { Header } from './header-new';
import { MobilePreview } from '../../mobile-preview';
import { MobilePreviewMode } from '../../../../../../common/common';

export function templateNew(this: EditCardPopup, { channel }: IEditCardAttrs) {
  return (
    <div class={styles.popupNew}>
      <Header
        card={this.card}
        typeData={this.typeData}
        onClose={() => this.close()}
        onSave={() => this.buttonSaveHandler()}
      />
      <div class={styles.content}>
        <div class={styles.leftCol}>
          {this.typeData.editComponent &&
            m(this.typeData.editComponent, {
              card: this.card,
              ref: (value) => (this.editComponent = value),
              onchange: this.cardChangeHandler.bind(this),
              channel,
            })}
        </div>
        <div class={styles.rightCol}>
          <MobilePreview
            class={styles.preview}
            mode={MobilePreviewMode.CARD}
            ref={this.previewLoadedHandler.bind(this)}
            channelId={channel?.id}
          />
        </div>
      </div>
    </div>
  );
}
