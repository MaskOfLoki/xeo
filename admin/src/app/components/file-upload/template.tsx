import { FileUpload } from './index';
import m from 'mithril';
import styles from './module.scss';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import cn from 'classnames';

export function template(this: FileUpload, { title, subtitle, type }) {
  const imageStyle: Partial<CSSStyleDeclaration> = {};
  const isValue = !isEmptyString(this.value) && !this.isDefault;

  if (isEmptyString(this.value)) {
    imageStyle.backgroundImage = 'url(assets/images/icons/upload.svg)';
    imageStyle.backgroundSize = '70% 70%';
  } else if (type === 'video' || (type === 'imageOrVideo' && this.value.includes('.mp4'))) {
    imageStyle.backgroundImage = 'url(assets/images/icons/video.svg)';
    imageStyle.backgroundSize = '70% 70%';
  } else if (type === 'sound') {
    imageStyle.backgroundImage = 'url(assets/images/icons/sounder.svg)';
    imageStyle.backgroundSize = '70% 70%';
  } else if (type === 'font') {
    imageStyle.backgroundImage = 'url(assets/images/icons/font.svg)';
    imageStyle.backgroundSize = '70% 70%';
  } else {
    imageStyle.backgroundImage = `url(${this.value})`;
    imageStyle.backgroundSize = 'contain';
  }

  return (
    <div class={cn(styles.fileUpload, ...this.class.split(' '))} onclick={this.clickHandler.bind(this)}>
      {!(isEmptyString(title) && isEmptyString(subtitle)) && (
        <div class={styles.column}>
          <div class={styles.title}>{title}</div>
          {!isEmptyString(subtitle) && <div class={styles.subtitle}>{subtitle}</div>}
        </div>
      )}
      <div class={styles.image} style={imageStyle}>
        {isValue && (
          <div class={styles.buttonDelete} onclick={this.buttonDeleteHandler.bind(this)}>
            X
          </div>
        )}
      </div>
    </div>
  );
}
