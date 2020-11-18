import m from 'mithril';
import styles from './module.scss';
import { EditCardPopup, IEditCardAttrs } from './index';
import { Header } from './header';
import { StopSettings } from './stop-settings';
import { MobilePreview } from '../../mobile-preview';
import { MobilePreviewMode } from '../../../../../../common/common';

export function template(this: EditCardPopup, { channel, disabledStopSettings }: IEditCardAttrs) {
  return (
    <div class={styles.popup}>
      <Header
        name={this.card.name}
        typeData={this.typeData}
        isEnableChangeMode={this.isEnableChangeMode}
        onChangeMode={(type) => this.changeModeHandler(type)}
        onClose={() => this.close()}
        onSave={() => this.buttonSaveHandler()}
        onInput={(e) => (this.card.name = e.target.value)}
      />
      <div class={styles.content}>
        <div class={styles.mainContent}>
          <StopSettings card={this.card} disableCensus={this.typeData.disableCensus} disabled={disabledStopSettings} />
          {this.typeData.editComponent &&
            m(this.typeData.editComponent, {
              card: this.card,
              ref: (value) => (this.editComponent = value),
              onchange: this.cardChangeHandler.bind(this),
              channel,
            })}
        </div>
        <div class={styles.rightContent}>
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
