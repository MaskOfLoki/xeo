import m from 'mithril';
import { PresetsSelect } from './index';
import styles from './module.scss';
import { Select } from '../select';
import { Button } from '../button';
import { IconButton } from '../icon-button';

export function template(this: PresetsSelect, { readonly, disabled }) {
  return (
    this.selected && (
      <div class={styles.presetRow}>
        <Select
          className={styles.presetSelect}
          value={this.selected.id}
          onChange={(val) => this.presetChangeHandler(val)}
          options={this.presetOptions}
        />
        {!readonly && (
          <Button text='Save' className={styles.saveButton} onClick={this.buttonSaveAsHandler.bind(this)} />
        )}
        {!readonly && (
          <IconButton className={styles.actionButton} icon='reset.svg' onClick={this.buttonResetHandler.bind(this)} />
        )}
        {!readonly && this.presets.length > 1 && this.selected?.name?.toLowerCase() !== 'default' && (
          <IconButton className={styles.actionButton} icon='trash.svg' onClick={this.buttonDeleteHandler.bind(this)} />
        )}
      </div>
    )
  );
}
