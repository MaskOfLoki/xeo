import { EditThumbs } from './index';
import styles from './module.scss';
import m from 'mithril';
import { Sidemenu } from '../../../../components-next/sidemenu';
import { IBaseEditAttrs } from '../base';

export function template(this: EditThumbs, { card }: IBaseEditAttrs) {
  return (
    <div class={styles.thumbsCard}>
      <div class={styles.leftCol}>
        <Sidemenu
          options={this.sidemenuOptions}
          selectedItem={this.selectedMenu}
          onItemSelect={(itemKey) => (this.selectedMenu = itemKey)}
        />
      </div>
      <div class={styles.rightCol}>{this.rightPanel && m(this.rightPanel, { card })}</div>
    </div>
  );
}
