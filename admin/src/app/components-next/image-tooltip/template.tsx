import m from 'mithril';
import { ImageTooltip, IImageTooltipAttrs } from './index';
import styles from './module.scss';

export function template(
  this: ImageTooltip,
  { ratio, resolution, fileTypes, maxFileSize, overlayOffsetX = '0', overlayOffsetY = '0' }: IImageTooltipAttrs,
) {
  const transformStyle = `translate(${overlayOffsetX}, ${overlayOffsetY})`;

  return (
    <div class={styles.imageTooltip}>
      <div class={styles.helpIcon}>?</div>
      <div class={styles.tooltip} style={{ transform: transformStyle }}>
        <div class={styles.tooltipTitle}>Image Specifications</div>
        <div>Ratio = {ratio}</div>
        <div>Resolution = {resolution}</div>
        <div>File Types = {fileTypes}</div>
        <div>Max File Size = {maxFileSize}</div>
      </div>
    </div>
  );
}
