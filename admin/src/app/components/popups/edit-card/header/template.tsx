import { Header, IHeaderAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { CardType } from '../../../../../../../common/common';
import { Input } from '../../../input';
import { MAX_COUPON_NAME } from '../../../../utils';

export function template(this: Header, { name, typeData, isEnableChangeMode, onInput, onClose, onSave }: IHeaderAttrs) {
  let colorNo = 0;

  if (
    typeData.type === CardType.REACTION_THUMBS ||
    typeData.type === CardType.REACTION_APPLAUSE ||
    typeData.type === CardType.SOUNDER ||
    typeData.type === CardType.REACTION_SLIDER
  ) {
    colorNo = 0;
  } else if (
    typeData.type === CardType.TRIVIA ||
    typeData.type === CardType.TRIVIA_IMAGE ||
    typeData.type === CardType.POLL ||
    typeData.type === CardType.POLL_IMAGE
  ) {
    colorNo = 1;
  } else if (typeData.type == CardType.IMAGE || typeData.type == CardType.VIDEO) {
    colorNo = 2;
  } else if (
    typeData.type === CardType.QB_TOSS ||
    typeData.type === CardType.HAT_SHUFFLE ||
    typeData.type === CardType.SKEEBALL ||
    typeData.type === CardType.POP_A_SHOT ||
    typeData.type === CardType.FAN_FILTER_CAM ||
    typeData.type === CardType.TUG_OF_WAR ||
    typeData.type === CardType.TURBO_TRIVIA_2
  ) {
    colorNo = 3;
  } else if (typeData.type === CardType.TARGET) {
    colorNo = 4;
  }

  return (
    <div class={styles['header' + colorNo]}>
      <div class={styles.left}>
        <span
          class={styles['icon' + colorNo]}
          style={{
            'mask-image': `url(assets/images/icons/${typeData.icon})`,
            '-webkit-mask-image': `url(assets/images/icons/${typeData.icon})`,
          }}
        />
        <div class={styles['subTitle' + colorNo]}>{typeData.subtitle ? typeData.subtitle : typeData.title}</div>
        <Input maxlength={MAX_COUPON_NAME} value={name} oninput={onInput} placeholder='Card Name' />
      </div>
      <div class={styles.right}>
        {isEnableChangeMode && (typeData.type === CardType.POLL_IMAGE || typeData.type === CardType.TRIVIA_IMAGE) && (
          <button class={styles.buttonTextBase} onclick={() => this.changeMode()}>
            <span class={styles.iconText} />
            <span>SWITCH TO TEXT MODE</span>
          </button>
        )}
        {isEnableChangeMode && (typeData.type === CardType.POLL || typeData.type === CardType.TRIVIA) && (
          <button class={styles.buttonTextBase} onclick={() => this.changeMode()}>
            <span class={styles.iconImage} />
            <span>SWITCH TO IMAGE MODE</span>
          </button>
        )}
        <button class={styles.saveButton} onclick={onSave}>
          SAVE
        </button>
        <div class={styles.closeButton} onclick={onClose}></div>
      </div>
    </div>
  );
}
