import { Card, ICardAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { ContextMenu } from '../context-menu';
import { CardStatus, CardType, MobilePreviewMode, ChannelType } from '../../../../../common/common';
import { CardPreview } from './preview';
import { MobilePreview } from '../mobile-preview';
import cn from 'classnames';
import { api } from '../../services/api';

export function template(this: Card, { onedit, ondelete, onduplicate, switchcardsets, preview, disabled }: ICardAttrs) {
  const menuItems = [];

  let isAddedToTimeLine = false;

  if (this.channel.timeline && !this.channel.online) {
    isAddedToTimeLine = this.channel.timeline?.cards.find((card) => card.id == this.card.id) ? true : false;
  }

  if (!this.channel.online || this.card.status === CardStatus.INACTIVE) {
    if (onduplicate) {
      menuItems.push({
        title: 'DUPLICATE',
        fn: onduplicate,
      });
    }

    menuItems.push({
      title: 'EDIT',
      fn: onedit,
    });

    if (this.channel.cardSets.length > 1) {
      menuItems.push({
        title: 'SWITCH CARD SETS',
        fn: switchcardsets,
      });
    }
  }

  const cardAttrs = {};

  if (this.channel.online) {
    menuItems.push({
      title: getCardStatusLabel(this.card.status),
      fn: this.buttonStatusHandler.bind(this),
    });

    if (this.card.type === CardType.SOUNDER) {
      menuItems.push({
        title: 'OPEN SOUNDOFF MIXER',
        fn: () =>
          window.open(
            GC_PRODUCTION
              ? `../sound-mixer/?channel=${this.channel.id}`
              : `http://localhost:8083/?gcClientId=${api.cid}&channel=${this.channel.id}`,
            '_blank',
          ),
      });
    }

    if (this.isMainboard) {
      menuItems.push({
        title: 'REMOVE FROM MAINBOARD',
        fn: this.removeFromMainboardHandler.bind(this),
      });
    } else {
      menuItems.push({
        title: 'SEND TO MAINBOARD',
        fn: this.sendToMainboardHandler.bind(this),
      });
    }
  } else if (ondelete) {
    menuItems.push({
      title: 'DELETE',
      fn: ondelete,
    });
  }

  const colorNo: number = getCardColorNumber(this.typeData.type);

  return (
    <ContextMenu items={menuItems}>
      <div id={this.card.id} class={cn(styles.cardWrapper, { [styles.online]: this.channel.online })}>
        <div
          class={cn(styles['card' + colorNo], { [styles.addedToTimeLine]: isAddedToTimeLine })}
          ondblclick={onedit}
          {...cardAttrs}
        >
          <div class={styles.iconTextRow}>
            <div
              class={cn(styles['icon' + colorNo], styles[getLabel(this.card.status)])}
              style={{
                'mask-image': `url(assets/images/icons/${this.typeData.icon})`,
                '-webkit-mask-image': `url(assets/images/icons/${this.typeData.icon})`,
              }}
            />
            <div class={styles.textColumn}>
              {!this.channel.online && (
                <div class={styles['title' + colorNo]}>{this.typeData.subtitle || this.typeData.title}</div>
              )}
              {this.channel.online && (
                <div class={styles['title' + colorNo]}>
                  <div class={cn(styles.status, styles[getLabel(this.card.status)])}>
                    {this.card.status !== CardStatus.INACTIVE
                      ? getLabel(this.card.status)
                      : this.typeData.subtitle || this.typeData.title}
                  </div>
                  <div class={styles.timerInfo}>{this.card.status === CardStatus.LIVE && this.status}</div>
                </div>
              )}
              <div class={styles.subtitle}>{this.card.name}</div>
            </div>
          </div>
          {preview && (
            <div class={styles.previewRow}>
              <CardPreview
                mode={MobilePreviewMode.CARD}
                ref={(value: MobilePreview) => {
                  this.preview = value;
                  this.preview.updateCard(this.card);
                }}
                channelId={this._channelId}
              />
            </div>
          )}
          {this.channel.online && !disabled && this.channel.type === ChannelType.MANUAL && (
            <div class={styles.buttonStatus} onmousedown={this.buttonStatusHandler.bind(this)}>
              <div class={cn(styles.iconStatus, getButtonStatusIconClass(this.card.status))} />
            </div>
          )}
        </div>
      </div>
    </ContextMenu>
  );
}

function getCardStatusLabel(status: CardStatus): string {
  switch (status) {
    case CardStatus.DONE:
      return 'RESET';
    case CardStatus.LIVE:
      return 'STOP';
    default:
      return 'PLAY';
  }
}

function getLabel(status: CardStatus) {
  switch (status) {
    case CardStatus.LIVE: {
      return `playing`;
    }
    case CardStatus.DONE: {
      return 'done';
    }
    case CardStatus.INACTIVE: {
      return 'inactive';
    }
  }
}

function getButtonStatusIconClass(status: CardStatus) {
  switch (status) {
    case CardStatus.DONE:
      return styles.reset;
    case CardStatus.LIVE:
      return styles.stop;
    default:
      return styles.play;
  }
}

export function getCardColorNumber(type: CardType): number {
  switch (type) {
    case CardType.TRIVIA:
    case CardType.TRIVIA_IMAGE:
    case CardType.POLL:
    case CardType.POLL_IMAGE: {
      return 1;
    }
    case CardType.IMAGE:
    case CardType.VIDEO:
    case CardType.BROWSER: {
      return 2;
    }
    case CardType.QB_TOSS:
    case CardType.HAT_SHUFFLE:
    case CardType.SKEEBALL:
    case CardType.POP_A_SHOT:
    case CardType.TUG_OF_WAR:
    case CardType.TURBO_TRIVIA_2:
    case CardType.FAN_FILTER_CAM: {
      return 3;
    }
    case CardType.TARGET: {
      return 4;
    }
  }

  return 0;
}
