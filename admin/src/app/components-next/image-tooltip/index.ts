import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface IImageTooltipAttrs {
  ratio: string;
  resolution: string;
  fileTypes: string;
  maxFileSize: string;
  overlayOffsetX?: string;
  overlayOffsetY?: string;
}

export class ImageTooltip implements ClassComponent<IImageTooltipAttrs> {
  public view(vnode: Vnode<IImageTooltipAttrs>) {
    return template.call(this, vnode.attrs);
  }
}
