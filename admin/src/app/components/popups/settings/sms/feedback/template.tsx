import m from 'mithril';
import styles from './module.scss';
import { SmsFeedback, ISmsFeedbackAttrs } from './index';

export function template(this: SmsFeedback, { total }: ISmsFeedbackAttrs) {
  return (
    <div id={styles.smsFeedback}>
      <div class={styles.header}>
        <div class={styles.title}>SEND SMS</div>
        <div class={styles.closeButton} onclick={this.close.bind(this)}></div>
      </div>
      <div class={styles.container}>
        <div class={styles.sent}>{this.sentCount} users sent sms</div>
        <div class={styles.remaining}>{total} users to receive text</div>
      </div>
    </div>
  );
}
