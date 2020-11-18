import m from 'mithril';
import { ArcadeScreen } from '.';
import styles from './module.scss';
import cn from 'classnames';
import { config } from '../../../services/ConfigService';

export function template(this: ArcadeScreen) {
  const width = `${5 * this.size}px`;
  return (
    <div
      class={cn(styles.screen, { [styles.hasChannelVideo]: this.hasChannelVideo })}
      style={{ backgroundImage: `url('${this.gameConfig().background?.portrait}')` }}
    >
      <div class={cn(styles.title)}>{this.gameConfig().title ?? 'ARCADE'}</div>
      {this.gameConfig().logo && (
        <div class={cn(styles.logo)}>
          <img src={this.gameConfig().logo} />
        </div>
      )}
      <div class={cn(styles.customTitle)}>{this.gameConfig().customMessage}</div>
      <div class={cn(styles.games)}>
        {this.layout == 'list' &&
          this.gamesGroups.map((group) =>
            group.map((game) => (
              <div class={styles.game} onclick={this.onGameSelect.bind(this, game)}>
                <div class={styles.gameTitle}>{this.gameName(game)}</div>
              </div>
            )),
          )}
        {/* {} */}
        {this.layout == 'tile' && (
          <div class={styles.groupSwiper}>
            <div class='swiper-wrapper'>
              {this.gamesGroups.map((group) => (
                <div class='swiper-slide'>
                  <div
                    class={styles.groupButtons}
                    style={{
                      width,
                      marginLeft: `calc((100% - ${width}) * 0.5)`,
                    }}
                  >
                    {group.map((game) => (
                      <div class={styles.gameButton}>
                        <div
                          class={styles.gameButtonImage}
                          style={{
                            width: `${this.size}px`,
                            height: `${this.size}px`,
                            backgroundImage: `url(${this.gameIcon(game)})`,
                          }}
                          onclick={this.onGameSelect.bind(this, game)}
                        />
                        <div class={styles.gameButtonName}>
                          <span>{this.gameName(game)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
