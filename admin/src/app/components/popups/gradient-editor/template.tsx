import m from 'mithril';

import { GradientEditor, PRESET_GRADIENTS } from '.';
import styles from './module.scss';
import { IGradientStep, GradientType, GradientDirection } from '../../../../../../common/types/Gradients';
import { buildGradientString } from '../../../../../../common/utils';

export function template(this: GradientEditor) {
  return (
    <div id={styles.gradient_editor}>
      <div class={styles.header}>
        <div class={styles.popup_title}>COLOR PICKER</div>
        <div class={styles.close_button} onclick={() => this.close()}>
          X
        </div>
      </div>
      <div class={styles.container}>
        <div class={styles.content}>
          <div class={styles.color_row}>
            <div class={styles.colors}>
              {this.isGradient &&
                this.renderSteps &&
                this.steps.map((step: IGradientStep, idx) => {
                  return (
                    <div
                      class={styles.color}
                      onclick={this.selectStep.bind(this, idx)}
                      data-selected={idx === this.selectedStep}
                      data-index={idx}
                    >
                      <div class={styles.color_container}>
                        <div class={styles.handle} />
                        <div class={styles.color_display_container}>
                          <div class={styles.color_display} style={{ backgroundColor: step.color }} />
                        </div>
                        <input
                          maxlength='7'
                          class={styles.color_input}
                          value={step.color}
                          oninput={this.colorInputChange.bind(this, idx)}
                          onblur={this.setColor.bind(this, idx)}
                        />
                        <div class={styles.delete_button} onclick={this.removeStep.bind(this, idx)} />
                      </div>
                    </div>
                  );
                })}
              {this.isGradient && this.steps.length < 5 && (
                <div class={styles.new_color}>
                  <div class={styles.new_color_button} onclick={this.addStep.bind(this)}>
                    <div>{this.steps.length > 1 ? 'ADD COLOR' : 'CREATE GRADIENT'}</div>
                  </div>
                </div>
              )}
              {!this.isGradient && (
                <div class={styles.color_display} style={{ backgroundColor: this.steps[0].color }} />
              )}
              {!this.isGradient && (
                <div class={styles.color}>
                  <div class={styles.color_container}>
                    <input
                      maxlength='7'
                      class={styles.color_input}
                      value={this.steps[0].color}
                      oninput={this.colorInputChange.bind(this, 0)}
                      onblur={this.setColor.bind(this, 0)}
                    />
                  </div>
                </div>
              )}
            </div>
            {this.isGradient && (
              <div class={styles.gradient_display}>
                <div
                  class={styles.gradient}
                  style={{
                    background: buildGradientString({
                      type: GradientType.Linear,
                      direction: GradientDirection.ToBottom,
                      steps: this.steps,
                    }),
                  }}
                />
              </div>
            )}
            <div class={styles.color_selector} />
          </div>
          {this.steps.length > 1 && (
            <div class={styles.type_row + (this.steps.length > 1 ? ` ${styles.mid_border}` : '')}>
              <div class={styles.description}>
                <div class={styles.text}>GRADIENT TYPE</div>
              </div>
              <div class={styles.types}>
                {PRESET_GRADIENTS.map((preset, idx) => {
                  return (
                    <div
                      class={styles.type_container}
                      data-selected={idx === this.selectedPreset}
                      onclick={this.selectPreset.bind(this, idx)}
                    >
                      <div
                        class={styles.type_display}
                        style={{
                          background: buildGradientString({
                            type: preset.type,
                            direction: preset.direction,
                            steps: this.steps,
                          }),
                        }}
                      />
                      <div class={styles.type_name}>{preset.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <div class={styles.footer}>
        <div class={styles.save_button} onclick={this.save.bind(this)}>
          <div class={styles.save_button_text}>SAVE</div>
        </div>
      </div>
    </div>
  );
}
