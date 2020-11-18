import m, { ClassComponent, Vnode } from 'mithril';
import cn from 'classnames';
import styles from './module.scss';

export interface IIconAttrs {
  name: string;
  width?: string;
  height?: string;
  backgroundSize?: string;
  className?: string;
}

export class Icon implements ClassComponent<IIconAttrs> {
  public view({ attrs }: Vnode<IIconAttrs>) {
    return <div class={cn(styles.image, attrs.className)} style={this.getStyles(attrs)} />;
  }

  private getStyles({ width, height, backgroundSize, name }: IIconAttrs) {
    const styleObj = {};
    this.pushStyle(styleObj, 'backgroundImage', `url(assets/images/icons/${name})`);
    this.pushStyle(styleObj, 'width', width);
    this.pushStyle(styleObj, 'height', height);
    this.pushStyle(styleObj, 'backgroundSize', backgroundSize);

    return styleObj;
  }

  private pushStyle(styleObj: any, key: string, val: string) {
    if (val !== undefined) {
      styleObj[key] = val;
    }
  }
}
