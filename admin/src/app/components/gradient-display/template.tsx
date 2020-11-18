import m from 'mithril';
import { GradientDisplay } from '.';
import styles from './module.scss';

export function template(this: GradientDisplay) {
  return (
    <div
      class={styles.gradientDisplay}
      style={{ backgroundImage: `linear-gradient(to right, ${this.left}, ${this.right})` }}
    ></div>
  );
}
