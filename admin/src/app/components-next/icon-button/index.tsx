import m, { ClassComponent, Vnode } from 'mithril';
import cn from 'classnames';
import styles from './module.scss';

export interface IIconButtonAttrs {
  icon: string;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
}

export class IconButton implements ClassComponent<IIconButtonAttrs> {
  public view({ attrs }: Vnode<IIconButtonAttrs>) {
    const { disabled, className, icon, onClick } = attrs;

    return (
      <button
        class={cn(styles.iconButton, className)}
        style={{ backgroundImage: `url(assets/images/icons/${icon})` }}
        disabled={disabled}
        onclick={() => onClick && onClick()}
      />
    );
  }
}
