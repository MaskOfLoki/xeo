import m from 'mithril';
import styles from './module.scss';
import { CardTypePopup } from './index';
import { ICardTypeData } from '../../../utils/CardTypeDataFactory';
import { CardType } from '../../../../../../common/common';

export function template(this: CardTypePopup) {
  function getColorNo(typeData: ICardTypeData) {
    let colorNo = 0;

    switch (typeData.type) {
      case CardType.REACTION_THUMBS:
      case CardType.REACTION_APPLAUSE:
      case CardType.REACTION_SLIDER:
      case CardType.SOUNDER:
        colorNo = 0;
        break;
      case CardType.TRIVIA:
      case CardType.TRIVIA_IMAGE:
      case CardType.POLL:
      case CardType.POLL_IMAGE:
        colorNo = 1;
        break;
      case CardType.IMAGE:
      case CardType.VIDEO:
      case CardType.BROWSER:
        colorNo = 2;
        break;
      case CardType.QB_TOSS:
      case CardType.HAT_SHUFFLE:
      case CardType.SKEEBALL:
      case CardType.TUG_OF_WAR:
      case CardType.TURBO_TRIVIA_2:
      case CardType.FAN_FILTER_CAM:
      case CardType.POP_A_SHOT:
        colorNo = 3;
        break;
      case CardType.TARGET:
      default:
        colorNo = 4;
    }

    return colorNo;
  }

  return (
    <div class={styles.popup}>
      <div class={styles.content}>
        <div class={styles.headerText}>
          <div class={styles.headerTitle}>Choose a card type</div>
          <div class={styles.closeButton} onclick={() => this.close()}></div>
        </div>
        <div class={styles.row}>
          {this.typeData.map((data, index) => {
            const colorNo = getColorNo(data);
            return (
              <div class={styles['button' + colorNo]} onclick={this.buttonHandler.bind(this, index)}>
                <div class={styles['buttonText' + colorNo]}>{data.subtitle ? data.subtitle : data.title}</div>
                <div
                  class={styles['buttonIcon' + colorNo]}
                  style={{
                    'mask-image': `url(assets/images/icons/${data.icon})`,
                    '-webkit-mask-image': `url(assets/images/icons/${data.icon})`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
