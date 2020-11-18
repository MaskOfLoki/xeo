import { CardsPanel, ICardsPanelAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { CardsPanelHeader } from './header';
import cn from 'classnames';
import { Card } from '../card';

export function template(this: CardsPanel, { disabled }: ICardsPanelAttrs) {
  return (
    <div class={cn(styles.control, { [styles.disabled]: disabled })}>
      <CardsPanelHeader
        oncardadd={this.buttonAddNewCardHandler.bind(this)}
        oncardsearch={this.buttonCardSearchHandler.bind(this)}
        oncardsetadd={this.buttonCardSetAddHandler.bind(this)}
        oncardsetedit={this.buttonCardSetEditHandler.bind(this)}
        oncardsetdelete={this.buttonCardSetDeleteHandler.bind(this)}
        oncardsetchange={this.buttonActiveCardSetChangeHandler.bind(this)}
        activeCardSet={this.activeCardSet}
        channel={this.channel}
      />
      <div class={styles.groupCards}>
        {this.visibleCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onedit={this.cardEditHandler.bind(this, card)}
            ondelete={this.cardDeleteHandler.bind(this, card)}
            onduplicate={this.cardDuplicateHandler.bind(this, card)}
            switchcardsets={this.switchCardSetsHandler.bind(this, card)}
            channel={this.channel}
            preview={this.isPreview}
            disabled={disabled}
          />
        ))}
      </div>
      <div class={styles.previewToggle}>
        <button
          class={cn(styles.previewBtn, { [styles.selected]: this.isPreview })}
          onclick={() => this.setChannelPreview(!this.isPreview)}
        ></button>
      </div>
    </div>
  );
}
