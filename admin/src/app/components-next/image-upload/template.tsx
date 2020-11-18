import m from 'mithril';
import cn from 'classnames';
import { ImageUpload, IImageUploadAttrs } from './index';
import styles from './module.scss';
import { IconButton } from '../icon-button';
import { EMPTY_IMAGE } from '../../../../../common/common';

export function template(
  this: ImageUpload,
  {
    width,
    height,
    preview,
    className,
    onRemove,
    image = EMPTY_IMAGE,
    horizontal,
    showBorder = true,
  }: IImageUploadAttrs,
) {
  return (
    <div class={cn(styles.imageUpload, className, { [styles.hasBorder]: showBorder })}>
      {image?.url ? (
        <div>
          {preview && <img src={image.url} alt='uploaded file' style={{ width: width || '100%', height }} />}
          <div class={styles.infoRow}>
            <div class={styles.fileInfo}>
              <div class={styles.filename}>{image.name || ''}</div>
              <div class={styles.filesize}>{image.size}</div>
            </div>
            <div class={styles.row}>
              <IconButton class={styles.editIcon} icon='edit.svg' onClick={this.uploadFile.bind(this)} />
              <IconButton class={styles.removeIcon} icon='trash.svg' onClick={() => onRemove && onRemove()} />
            </div>
          </div>
        </div>
      ) : (
        <div
          class={cn(styles.empty, { [styles.horizontal]: horizontal })}
          style={{ width: width || '100%', height }}
          onclick={this.uploadFile.bind(this)}
        >
          <div class={styles.uploadImage} />
          <div class={styles.uploadLabel}>Click to Upload</div>
        </div>
      )}
    </div>
  );
}
