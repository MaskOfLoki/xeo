import { CardSetDropdown, ICardSetDropdownAttrs } from './index';
import styles from './module.scss';
import m from 'mithril';

export function template(
  this: CardSetDropdown,
  { oncardsetadd, oncardsetedit, oncardsetdelete, oncardsetchange, activeCardSet, channel }: ICardSetDropdownAttrs,
) {
  return (
    <div class={styles.control}>
      <div class={styles.cardSetAdd} onclick={oncardsetadd}>
        +
      </div>
      <div class={styles.cardSetEdit} onclick={() => oncardsetedit(activeCardSet)}></div>
      <select
        id={styles.cardSetSelect}
        onchange={(e) => {
          oncardsetchange(channel.cardSets.find((set) => set.id == e.target.value));
        }}
      >
        {channel.cardSets.map((set) => (
          <option class={styles.cardSetOption} selected={set.id === activeCardSet.id} value={set.id}>
            {set.name}
          </option>
        ))}
        {/* <option class={styles.cardSetOption} onclick={oncardsetadd}>ADD NEW SET...</option> */}
      </select>
      {channel.cardSets.length > 1 && (
        <div class={styles.cardSetDelete} onclick={() => oncardsetdelete(activeCardSet)}></div>
      )}
    </div>
  );
}
