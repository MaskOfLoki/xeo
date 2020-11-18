import m from 'mithril';
import styles from './module.scss';
import { AdvancedFilterPopup } from './index';
import { TargetFilter } from '../../target-filter';

export function template(this: AdvancedFilterPopup, { channel }) {
  return (
    <div class={styles.popup}>
      <div class={styles.headerText}>
        <div class={styles.headerTitle}>ADVANCED FILTERS</div>
        <div class={styles.space}></div>
        <div class={styles.menuButton} onclick={this.menuHandler.bind(this)}></div>
      </div>
      <div class={styles.mainContainer}>
        {this.filters.map((filter, index) => (
          <div class={styles.filterRow}>
            <TargetFilter filter={filter} channel={channel} onchange={(value) => (this.filters[index] = value)} />
            <div class={styles.deletFilterBtn} onclick={this.buttonDeleteHandler.bind(this, index)} />
          </div>
        ))}
        <div class={styles.addFilterRow} onclick={this.buttonAddHandler.bind(this)}>
          <div class={styles.label}>ADD FILTER</div>
          <div class={styles.addFilterBtn}>+</div>
        </div>
      </div>
      <div class={styles.controls}>
        <button class={styles.cancel} onclick={this.close.bind(this, undefined)}>
          CANCEL
        </button>
        <button class={styles.confirm} onclick={this.buttonConfirmHandler.bind(this)}>
          APPLY
        </button>
      </div>
    </div>
  );
}
