import m from 'mithril';
import cn from 'classnames';
import { Header, IHeaderAttrs } from './index';
import styles from './module.scss';
import { Input } from '../../../../components-next/input';
import { SplitToggle } from '../../../../components-next/split-toggle';
import { FullScreenToggle } from '../../../../components-next/fullscreen-toggle';
import { Button } from '../../../../components-next/button';
import { StopSettingsNew } from '../stop-settings-new';
import { getCardColorNumber } from '../../../../components/card/template';

export function template(this: Header, { card, typeData, onClose, onSave }: IHeaderAttrs) {
  const colorNo: number = getCardColorNumber(typeData.type);

  return (
    <div class={cn(styles.headerNew, styles['headerNew' + colorNo])}>
      <div class={styles.background} />
      <div class={styles.topRow}>
        <img class={styles.cardIcon} src={`assets/images/icons/${typeData.icon}`} alt='card icon' />
        <div class={styles.fill}>
          {typeData.title} {typeData.subtitle}
        </div>
        <Button className={styles.saveButton} text='Save' onClick={onSave} />
        <div class={styles.closeButton} onclick={onClose}></div>
      </div>
      <div class={styles.row}>
        <div class={styles.nameCol}>
          <Input label='NAME' max={60} value={card.name} showRemaining onChange={(val) => (card.name = val)} />
        </div>
        <div class={styles.stopCol}>
          <StopSettingsNew card={card} />
        </div>
        <div class={styles.screenCol}>
          <SplitToggle value={this.splitScreen} onChange={(val) => (this.splitScreen = val)} />
          <FullScreenToggle value={this.fullscreen} onChange={(val) => (this.fullscreen = val)} />
        </div>
      </div>
    </div>
  );
}
