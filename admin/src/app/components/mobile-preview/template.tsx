import { IMobilePreviewAttrs, MobilePreview } from './index';
import styles from './module.scss';
import m, { Vnode } from 'mithril';
import cn from 'classnames';

export function template(this: MobilePreview, vnode: Vnode<IMobilePreviewAttrs>) {
  return (
    <div
      class={cn(styles.preview, ...(vnode.attrs.class || '').split(' '))}
      style={{
        height: `${(this.width * 16) / 9}px`,
      }}
    >
      <iframe src={this.url} />
    </div>
  );
}
