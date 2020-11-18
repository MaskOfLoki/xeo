import { PhoneCodeSelect, IPhoneCodeSelectAttrs } from './index';
import m from 'mithril';
import { config } from '../../../services/ConfigService';
import { countries } from './countries';
import styles from './module.scss';

export function template(this: PhoneCodeSelect, { country, onchange }: IPhoneCodeSelectAttrs) {
  return (
    <div class={styles.control}>
      <span class={styles.inputLabel}>COUNTRY</span>
      <select
        style={{
          background: config.home.colors.field,
          color: config.home.colors.text,
          'min-height': '8vmin',
        }}
        onchange={(e) => onchange(countries[e.target.selectedIndex])}
      >
        {countries.map(([name, phone]) => (
          <option selected={name === country[0]}>
            {name} +{phone}
          </option>
        ))}
      </select>
    </div>
  );
}
