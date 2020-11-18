import { TargetFilter } from './index';
import styles from './module.scss';
import m from 'mithril';
import { OptionType } from './services';
import { Input } from '../../../../input';

export function template(this: TargetFilter) {
  return (
    this.service && (
      <div class={styles.control}>
        <div class={styles.column}>
          <div class={styles.label}>TARGET TYPE</div>
          <select
            onchange={(e) =>
              this.filterTypeChangeHandler({ type: this.targets[(e.target as HTMLSelectElement).selectedIndex].type })
            }
          >
            {this.targets.map((item) => (
              <option value={item.type} selected={this.service.getFilter().type === item.type}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        {this.options.map((items, index) => (
          <div class={styles.column}>
            <div class={styles.label}>{this.service.getOptionLabel(index)}</div>
            {this.service.getOptionType(index) === OptionType.SELECT && (
              <select
                onchange={(e) => this.optionChangeHandler(index, (e.target as HTMLSelectElement).selectedIndex - 1)}
              >
                <option>---</option>
                {items.map((item) => (
                  <option selected={this.service.getSelectedOption(index) === item}>{item}</option>
                ))}
              </select>
            )}
            {this.service.getOptionType(index) === OptionType.NUMBER && (
              <Input
                type='number'
                min='0'
                value={this.service.getSelectedOption(index)}
                oninput={(e) => this.service.updateOption(index, parseInt(e.target.value))}
              />
            )}
          </div>
        ))}
      </div>
    )
  );
}
