import { CardsPanelHeader, ICardsPanelHeaderAttrs } from './index';
import { CardSetDropdown } from './card-set-dropdown';
import styles from './module.scss';
import cn from 'classnames';
import m from 'mithril';

export function template(
  this: CardsPanelHeader,
  {
    oncardadd,
    oncardsearch,
    oncardsetadd,
    oncardsetedit,
    oncardsetdelete,
    oncardsetchange,
    activeCardSet,
    channel,
  }: ICardsPanelHeaderAttrs,
) {
  return (
    <div class={styles.control}>
      <div class={styles.title}>CARDS</div>
      <div class={styles.buttonAdd} onclick={oncardadd}>
        +
      </div>
      <div class={styles.cardSetDropdown}>
        <CardSetDropdown
          oncardsetadd={oncardsetadd}
          oncardsetedit={oncardsetedit}
          oncardsetdelete={oncardsetdelete}
          oncardsetchange={oncardsetchange}
          oncardsearch={oncardsearch}
          activeCardSet={activeCardSet}
          channel={channel}
        />
      </div>
      <button onclick={oncardsearch} class={cn('outline', styles.cardSearch)}></button>
    </div>
  );
}
