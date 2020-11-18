import styles from './module.scss';
import m from 'mithril';
import { TeamList } from './index';
import cn from 'classnames';

export function template(this: TeamList) {
  return (
    <div class={styles.mainContainer}>
      <div class={styles.header}>
        <div class={styles.label}>Current Teams</div>
        <div class={styles.addButton} onclick={() => this.onTeamAdd()}>
          +
        </div>
      </div>
      {this.teamNames.map((name, index) => (
        <div
          class={cn(styles.teamItemPanel, { [styles.active]: this.selectedIndex === index })}
          onclick={() => this.onTeamSelect(index)}
        >
          <div class={styles.teamItemLabel}>{name}</div>
          <button class={styles.buttonDelete} onclick={() => this.onTeamDelete(index)} />
        </div>
      ))}
    </div>
  );
}
