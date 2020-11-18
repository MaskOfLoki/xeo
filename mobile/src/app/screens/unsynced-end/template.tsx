import { UEndingScreen } from './index';
import styles from './module.scss';
import m from 'mithril';
import { config } from '../../services/ConfigService';
import { isEmptyString } from '@gamechangerinteractive/xc-backend/utils';
import { Button } from '../../components/button';

export function template(this: UEndingScreen) {
  return (
    <div
      class={styles.screen}
      //   onclick={this.clickHandler.bind(this)}
      style={{
        backgroundImage: `url(${
          this.mode == 'replay' ? config.program.replay.background : config.program.thankyou.background
        })`,
      }}
    >
      {!isEmptyString(this.mode == 'replay' ? config.program.replay.logo : config.program.thankyou.logo) && (
        <div
          class={styles.logo}
          style={{
            backgroundImage: `url(${
              this.mode == 'replay' ? config.program.replay.logo : config.program.thankyou.logo
            })`,
          }}
        />
      )}
      <div class={styles.message}>
        {this.mode == 'replay' ? config.program.replay.message : config.program.thankyou.message}
      </div>
      {this.mode == 'replay' && (
        <div class={styles.button_container}>
          <Button class={styles.button} onclick={this.clickHandler.bind(this)}>
            Replay
          </Button>
        </div>
      )}
    </div>
  );
}
