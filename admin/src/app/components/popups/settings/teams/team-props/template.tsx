import styles from './module.scss';
import m from 'mithril';
import { TeamProps } from './index';
import { Input } from '../../../../input';
import { MAX_TEAM_NAME } from '../../../../../utils';

export function template(this: TeamProps) {
  return (
    <div class={styles.mainContainer}>
      <div class={styles.header}>
        <div class={styles.title}>{this.updatedTeam.name}</div>
        <div class={styles.targeting}>
          <span class={styles.targetingIcon}>&#11095;</span>
          Team Targeting
        </div>
        <div class={styles.saveButton}>
          <button onclick={() => this.onSave(this.updatedTeam)}>Save</button>
        </div>
      </div>
      <div class={styles.namePanel}>
        <Input
          placeholder='enter team name'
          maxlength={MAX_TEAM_NAME}
          value={this.updatedTeam.name}
          oninput={(e) => {
            this.updatedTeam.name = e.target.value;
          }}
        />
      </div>

      <div class={styles.linkPanel}>
        <div class={styles.label}>Team link:</div>
        <Input value={this.updatedTeam.url} readonly={true} />
      </div>

      <div class={styles.pinPanel}>
        <div class={styles.label}>PIN code:</div>
        <Input readonly={true} value={this.updatedTeam.pin} />
      </div>
    </div>
  );
}
