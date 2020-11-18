import m, { ClassComponent, Vnode } from 'mithril';
import cn from 'classnames';
import styles from './module.scss';

export interface IButtonAttrs {
  text: string;
  className?: string;
  disabled?: boolean;
  textButton?: boolean;
  outlined?: boolean;
  onClick: () => void;
}

export class Button implements ClassComponent<IButtonAttrs> {
  public view({ attrs }: Vnode<IButtonAttrs>) {
    const { disabled, className, text, textButton, outlined, onClick } = attrs;

    return (
      <button
        class={cn(styles.button, { [styles.textButton]: textButton }, { [styles.outlined]: outlined }, className)}
        disabled={disabled}
        onclick={() => onClick && onClick()}
      >
        {text}
      </button>
    );
  }
}
