import styles from './module.scss';
import m from 'mithril';
import { TeamsSettings } from './index';
import { TeamList } from './team-list';
import { TeamProps } from './team-props';
import { Slide } from '../../../slide';

export function template(this: TeamsSettings) {
  if (!this.teamPlay) {
    return <div class={styles.loading}>loading...</div>;
  }

  return (
    <div class={styles.mainContainer}>
      <div class={styles.mainPanel}>
        <div class={styles.titlePanel}>
          <div class={styles.titleLabel}>TEAMS</div>
          <Slide selected={this.teamPlay.enabled} onchange={(value) => this.setEnabled(value)}>
            Enable
          </Slide>
          &nbsp;&nbsp;
          <Slide selected={this.teamPlay.mandatory} onchange={(value) => this.setMandatory(value)}>
            Mandatory
          </Slide>
        </div>

        <div class={styles.mainContent}>
          <div class={styles.teamListPanel}>
            <TeamList
              teamNames={this.teamPlay.teams.map((t) => t.name)}
              onTeamAdd={() => this.onTeamAdd()}
              onTeamDelete={(i) => this.onTeamDelete(i)}
              selectedIndex={this.selectedTeamIndex}
              onTeamSelect={(i) => this.onTeamSelect(i)}
            />
          </div>
          <div class={styles.teamPropsPanel}>
            {this.selectedTeamIndex >= 0 && this.selectedTeamIndex < this.teamPlay.teams.length && (
              <TeamProps
                team={this.teamPlay.teams[this.selectedTeamIndex]}
                onSave={(team) => this.onTeamUpdate(team)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
