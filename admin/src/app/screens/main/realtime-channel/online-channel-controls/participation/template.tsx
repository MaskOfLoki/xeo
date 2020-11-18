import { IParticipationData } from './index';
import styles from './module.scss';
import m from 'mithril';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { ParticipationBar } from './bar';
import { Tooltip } from '../../../../../components/tooltip';
import { ICard, IParticipation } from '../../../../../../../../common/common';

export function template(data: IParticipationData, card: ICard, participation: IParticipation) {
  return (
    data && (
      <div class={styles.control}>
        <div class={styles.title}>{data.title}</div>
        {!isEmptyString(data.subtitle) && <div class={styles.subtitle}>{data.subtitle}</div>}
        <div class={styles.row}>
          {data.component && m(data.component, { card, participation })}
          {!data.component && data.bars && data.bars.length > 0 && (
            <div class={styles.groupBars}>
              {data.bars.map((item) =>
                item.tooltip ? (
                  <Tooltip {...item.tooltip}>
                    <ParticipationBar {...item} />
                  </Tooltip>
                ) : (
                  <ParticipationBar {...item} />
                ),
              )}
            </div>
          )}
          <div class={styles.groupTotal}>
            <div class={styles.icon}></div>
            <div class={styles.total}>{data.total}</div>
          </div>
        </div>
      </div>
    )
  );
}
