import m from 'mithril';
import { PresetsSelect } from './index';
import styles from './module.scss';
import cn from 'classnames';

export function template(this: PresetsSelect, { readonly, disabled }) {
  return (
    this.selected && (
      <div class={cn(styles.presetsSelect, { [styles.disabled]: disabled })}>
        <div class={styles.designLabel}>CARD DESIGN</div>
        <div class={styles.presetRow}>
          <select onchange={(e) => this.presetChangeHandler(e.target.selectedIndex)}>
            {this.presets.map((preset) => (
              <option selected={this.selected.id === preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
        <div class={styles.presetButtons}>
          {!readonly && (
            <button class='outline' onclick={this.buttonSaveAsHandler.bind(this)}>
              SAVE
            </button>
          )}
          {!readonly && <button class={styles.buttonReset} onclick={this.buttonResetHandler.bind(this)}></button>}
          {!readonly && this.presets.length > 1 && this.selected?.name?.toLowerCase() !== 'default' && (
            <button class={styles.buttonDelete} onclick={this.buttonDeleteHandler.bind(this)} />
          )}
        </div>
      </div>
    )
  );
}
