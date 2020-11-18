import m from 'mithril';
import styles from './module.scss';
import { LayoutItem } from '.';
import { MainboardLayoutItemType } from '../../../../../../../common/common';
import { ConfigFileUpload } from '../../../config-file-upload';

export function template(this: LayoutItem) {
  return (
    <div class={styles.control}>
      {this.item.types.length > 1 && (
        <select onchange={(e) => this.typeChangeHandler(e.target.selectedIndex)}>
          {this.item.types.map((type) => (
            <option selected={this.type == type} value={type}>
              {getTitle(type)}
            </option>
          ))}
        </select>
      )}
      {this.item.types.length === 1 && <div class={styles.title}>{getTitle(this.item.types[0])}</div>}
      {(this.type == MainboardLayoutItemType.IMAGE ||
        this.type == MainboardLayoutItemType.VIDEO ||
        this.type == MainboardLayoutItemType.IMAGE_VIDEO) && <div class={styles.uploadLabel}>CLICK TO UPLOAD</div>}
      {this.type == MainboardLayoutItemType.IMAGE && (
        <div class={styles.uploadField}>
          <ConfigFileUpload configField={this.valueField} namespace={this.namespace} />
        </div>
      )}
      {this.type == MainboardLayoutItemType.VIDEO && (
        <div class={styles.uploadField}>
          <ConfigFileUpload configField={this.valueField} namespace={this.namespace} type='video' />
        </div>
      )}
      {this.type == MainboardLayoutItemType.IMAGE_VIDEO && (
        <div class={styles.uploadField}>
          <ConfigFileUpload configField={this.valueField} namespace={this.namespace} type='imageOrVideo' />
        </div>
      )}
    </div>
  );
}

function getTitle(type: MainboardLayoutItemType) {
  switch (type) {
    case MainboardLayoutItemType.IMAGE_VIDEO: {
      return 'IMAGE/VIDEO';
    }
    default:
      return type.split('_').join(' ');
  }
}
