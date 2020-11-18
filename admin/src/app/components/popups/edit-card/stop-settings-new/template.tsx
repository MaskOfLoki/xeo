import m from 'mithril';
import cn from 'classnames';
import { IStopSettingsNewAttrs, StopSettingsNew } from './index';
import styles from './module.scss';
import { Checkbox } from '../../../../components-next/checkbox';
import { Timer } from '../../../../components-next/timer';
import { Input } from '../../../../components-next/input';
import { CardStopMode } from '../../../../../../../common/common';

export function template(this: StopSettingsNew, { card }: IStopSettingsNewAttrs) {
  return (
    <div class={styles.stopSettings}>
      <div class={styles.col}>
        <Checkbox
          label='Auto'
          value={card.stopMode === CardStopMode.AUTO}
          onChange={() => (card.stopMode = CardStopMode.AUTO)}
        />
        <div class={styles.autoTimeout}>
          <Timer
            value={card.stopTimer || 0}
            disabled={card.stopMode !== CardStopMode.AUTO}
            size='small'
            onChange={(val) => (card.stopTimer = val)}
          />
        </div>
      </div>
      <div class={styles.col}>
        <Checkbox
          label='Manual'
          value={card.stopMode === CardStopMode.MANUAL}
          onChange={() => (card.stopMode = CardStopMode.MANUAL)}
        />
      </div>
      <div class={styles.col}>
        <Checkbox
          label='Census'
          value={card.stopMode === CardStopMode.CENSUS}
          onChange={() => (card.stopMode = CardStopMode.CENSUS)}
        />
        <div class={styles.censusUserCount}>
          <Input
            value={card.stopCensus}
            size='small'
            disabled={card.stopMode !== CardStopMode.CENSUS}
            onChange={(val) => (card.stopCensus = +val)}
          />
          <div class={cn(styles.userIcon, { [styles.disabled]: card.stopMode !== CardStopMode.CENSUS })} />
        </div>
      </div>
    </div>
  );
}
