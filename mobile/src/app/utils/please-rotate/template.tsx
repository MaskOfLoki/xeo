import m from 'mithril';
import cn from 'classnames';

import styles from './module.scss';

export function template(disabled = false) {
  return (
    <div id={styles.pleaserotateBackdrop} class={cn({ [styles.disabled]: disabled })}>
      <div id={styles.pleaserotateContainer}>
        <svg id={styles.pleaserotateGraphic} viewbox='0 0 250 250'>
          <g id={styles.pleaserotateGraphicPath} transform='translate(-12, -35) scale(0.89) rotate(-90 125 125)'>
            <path
              d={
                // tslint:disable-next-line:max-line-length
                'M190.5,221.3c0,8.3-6.8,15-15,15H80.2c-8.3,0-15-6.8-15-15V28.7c0-8.3,6.8-15,15-15h95.3c8.3,0,15,6.8,15,15V221.3z' +
                //       // tslint:disable-next-line:max-line-length
                'M74.4,33.5l-0.1,139.2c0,8.3,0,17.9,0,21.5c0,3.6,0,6.9,0,7.3c0,0.5,0.2,0.8,0.4,0.8s7.2,0,15.4,0h75.6c8.3,0,15.1,0,15.2,0' +
                //       // tslint:disable-next-line:max-line-length
                's0.2-6.8,0.2-15V33.5c0-2.6-1-5-2.6-6.5c-1.3-1.3-3-2.1-4.9-2.1H81.9c-2.7,0-5,1.6-6.3,4C74.9,30.2,74.4,31.8,74.4,33.5z' +
                'M127.7,207c-5.4,0-9.8,5.1-9.8,11.3s4.4,11.3,9.8,11.3s9.8-5.1,9.8-11.3S133.2,207,127.7,207z'
              }
            />
          </g>
        </svg>
        <div id={styles.pleaserotateMessage} style='color: black;'>
          Please Rotate Your Device
        </div>
      </div>
    </div>
  );
}
