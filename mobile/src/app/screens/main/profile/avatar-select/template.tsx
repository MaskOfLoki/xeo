import { AvatarSelectScreen } from './index';
import m from 'mithril';
import cn from 'classnames';
import { Avatar } from '../../../../components/avatar';
import { Button } from '../../../../components/button';
import styles from './module.scss';

export function template(this: AvatarSelectScreen) {
  const width = `${3 * (this.size + 4) + 60}px`;

  return (
    <div class={cn(styles.screen, { [styles.hasChannelVideo]: this.hasChannelVideo })}>
      <div class={styles.title}>
        <div></div>
        <div></div>
      </div>
      <div class={styles.subTitle}>Choose one for your profile!</div>
      <div class={styles.groupSwiper}>
        <div class='swiper-wrapper'>
          {!this.useCustomAvatars &&
            this.avatarSlides.map((avatars) => (
              <div class='swiper-slide'>
                <div
                  class={styles.groupAvatars}
                  style={{
                    width,
                    marginLeft: `calc((100% - ${width}) * 0.5)`,
                  }}
                >
                  {avatars.map((avatar) => (
                    <Avatar
                      class={cn(styles.avatar, {
                        [styles.selected]: this.selected === avatar,
                      })}
                      style={{
                        width: `${this.size}px`,
                        height: `${this.size}px`,
                      }}
                      index={avatar}
                      onclick={() => (this.selected = avatar)}
                    />
                  ))}
                </div>
              </div>
            ))}
          {this.useCustomAvatars &&
            this.customAvatars.map((avatars) => (
              <div class='swiper-slide'>
                <div
                  class={styles.groupAvatars}
                  style={{
                    width,
                    marginLeft: `calc((100% - ${width}) * 0.5)`,
                  }}
                >
                  {avatars.map((avatar) => (
                    <Avatar
                      class={cn(styles.avatar, {
                        [styles.selected]: this.selectedUrl === avatar,
                      })}
                      style={{
                        width: `${this.size}px`,
                        height: `${this.size}px`,
                        backgroundImage: `url('${avatar}')`,
                      }}
                      index={avatar}
                      onclick={() => (this.selectedUrl = avatar)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
      <Button
        type='grad1'
        disabled={this.selected == null && this.selectedUrl == null}
        class={styles.button}
        onclick={this.buttonChooseHandler.bind(this)}
      >
        Next
      </Button>
    </div>
  );
}
