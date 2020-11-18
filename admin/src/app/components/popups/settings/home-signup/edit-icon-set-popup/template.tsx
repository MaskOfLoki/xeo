import m from 'mithril';
import styles from './module.scss';
import { EditIconSetPopup } from './index';
import { Input } from '../../../../input';
import { MAX_CARDSET_NAME } from '../../../../../utils';
import { FileUpload } from '../../../../file-upload';

export function template(this: EditIconSetPopup) {
  return (
    <div class={styles.popup}>
      <div class={styles.header}>ICON SET</div>
      <div class={styles.inputContainer}>
        <Input
          placeholder='Icon Set Name'
          value={this.iconSet.name}
          maxlength={MAX_CARDSET_NAME}
          oninput={(e) => {
            this.iconSet.name = e.target.value;
          }}
        ></Input>
      </div>
      <div class={styles.iconSetContainer}>
        <div class={styles.iconUploadWrapper}>
          <FileUpload
            class={styles.iconUpload}
            // title='Mainboard Image'
            onchange={(value) => {
              this.newIcons.push(value);
            }}
            multipleFiles={true}
          />
        </div>
        <div class={styles.iconsInSet}>
          {this.iconSet.icons
            .concat(this.newIcons)
            .filter((i) => !this.deletedIcons.includes(i))
            .map((icon) => {
              return (
                <div class={styles.iconPreview}>
                  <div class={styles.icon} style={{ backgroundImage: `url('${icon}'` }}></div>
                  <div class={styles.iconDelete} id={icon} onclick={this.flagForDelete.bind(this)}>
                    X
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div class={styles.controls}>
        <button class={styles.confirm} onclick={this.buttonSaveHandler.bind(this)}>
          SAVE ICON SET
        </button>
        <button class={styles.cancel} onclick={this.close.bind(this, undefined)}>
          CANCEL
        </button>
      </div>
    </div>
  );
}
