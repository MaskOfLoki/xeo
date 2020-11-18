import m from 'mithril';
import { MarketingMessage } from '.';
import cn from 'classnames';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { config } from '../../services/ConfigService';
import styles from './module.scss';

export function template(this: MarketingMessage, attrs) {
  if (this.message) {
    const isText = !isEmptyString(this.message.text);

    return (
      <div
        class={cn(styles.control, attrs.class, { [styles.image]: !isText })}
        onclick={this.clickHandler.bind(this)}
        style={{
          backgroundColor: `${config.home.colors.levels[4]}80`,
          borderColor: config.home.colors.levels[2],
        }}
      >
        {isText && this.message.text}
        {!isText && <img src={`${this.message.image}`}></img>}
      </div>
    );
  } else {
    return <div class={cn(styles.empty, attrs.class)} />;
  }
}
