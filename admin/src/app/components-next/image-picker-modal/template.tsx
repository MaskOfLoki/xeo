import m from 'mithril';
import cn from 'classnames';
import { Button } from '../button';
import { Icon } from '../icon';
import { ImagePickerModal } from './index';
import styles from './module.scss';
import { IconButton } from '../icon-button';

export function template(this: ImagePickerModal) {
  return (
    <div class={styles.imagePickerModal}>
      <div class={styles.leftCol}>
        <div
          class={cn({ [styles.dragging]: this.dragging })}
          ondragover={this.dragover.bind(this)}
          ondragleave={() => (this.dragging = false)}
          ondragend={() => (this.dragging = false)}
          ondrop={this.drop.bind(this)}
        >
          <Icon name='upload1.svg' className={styles.uploadImage} />
          <div class={styles.uploadLabel}>
            Drag and Drop file
            <br />
            or
          </div>
          <Button text='Choose File' className={styles.chooseButton} onClick={() => this.uploadFile()} />
        </div>
      </div>
      {this.imageObj.url && (
        <div class={styles.rightCol}>
          <div>
            <div class={styles.image}>
              <img src={this.imageObj.url} alt='uploaded' />
            </div>
            <div class={styles.imageInfo}>
              <Icon name='image.svg' width='2rem' height='2rem' />
              <div class={styles.imageMeta}>
                <div class={styles.imageName}>{this.imageObj.name}</div>
                <div class={styles.imageSize}>{this.imageObj.size}</div>
              </div>
              <Icon name='green_check.svg' width='2rem' height='2rem' />
            </div>
            <div class={styles.actions}>
              <Button text='Cancel' textButton onClick={() => this.close()} />
              <Button text='Save' outlined disabled={!this.changed} onClick={() => this.save()} />
            </div>
          </div>
        </div>
      )}
      <div class={styles.closeButton}>
        <IconButton icon='close-black.svg' onClick={() => this.close()} />
      </div>
    </div>
  );
}
