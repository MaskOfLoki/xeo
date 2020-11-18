import m from 'mithril';
import { EditPGP } from '.';
import styles from './module.scss';
import { Tabs } from '../../../tabs';
import { Tab } from '../../../tabs/tab';
import { ColorPicker } from '../../../color-picker';
import { Input } from '../../../input';

export function template(this: EditPGP) {
  return (
    <div class={styles.control}>
      <div class={styles.row}>
        <div class={styles.pgpEditor}>
          <button onclick={this.openPGPAdmin.bind(this)}>PGP Editor</button>
        </div>
      </div>
      <Tabs title='DESIGN SETTINGS'>
        <Tab label='COLORS'>
          <div class={styles.row}>
            <ColorPicker
              label='Primary Color'
              color={this.card.colors?.primary ?? '#FFFFFF'}
              onchange={(color) => {
                this.card.colors.primary = color;
                this._onchange();
              }}
            />
            <ColorPicker
              label='Pending'
              color={this.card.colors?.pending ?? '#5F5F5F'}
              onchange={(color) => {
                this.card.colors.pending = color;
                this._onchange();
              }}
            />
            <ColorPicker
              label='Text 1'
              color={this.card.colors?.text ?? '#000000'}
              onchange={(color) => {
                this.card.colors.text = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.row}>
            <ColorPicker
              label='Secondary Color'
              color={this.card.colors?.secondary ?? '#FFFFFF'}
              onchange={(color) => {
                this.card.colors.secondary = color;
                this._onchange();
              }}
            />
            <ColorPicker
              label='Correct'
              color={this.card.colors?.correct ?? '#00B21B'}
              onchange={(color) => {
                this.card.colors.correct = color;
                this._onchange();
              }}
            />
            <ColorPicker
              label='Text 2'
              color={this.card.colors?.text2 ?? '#000000'}
              onchange={(color) => {
                this.card.colors.text2 = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.row}>
            <ColorPicker
              label='Tertiary Color'
              color={this.card.colors?.background ?? '#EEEEEE'}
              onchange={(color) => {
                this.card.colors.background = color;
                this._onchange();
              }}
            />
            <ColorPicker
              label='Incorrect'
              color={this.card.colors?.incorrect ?? '#BA0000'}
              onchange={(color) => {
                this.card.colors.incorrect = color;
                this._onchange();
              }}
            />
            <ColorPicker
              label='Text 3'
              color={this.card.colors?.text3 ?? '#000000'}
              onchange={(color) => {
                this.card.colors.text3 = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.row}>
            <div class={styles.filler} />
            <ColorPicker
              label='Pushed'
              color={this.card.colors?.pushed ?? '#FFD800'}
              onchange={(color) => {
                this.card.colors.pushed = color;
                this._onchange();
              }}
            />
            <ColorPicker
              label='Text 4'
              color={this.card.colors?.text4 ?? '#000000'}
              onchange={(color) => {
                this.card.colors.text4 = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.row}>
            <div class={styles.filler} />
            <div class={styles.filler} />
            <ColorPicker
              label='Text 5'
              color={this.card.colors?.text5 ?? '#000000'}
              onchange={(color) => {
                this.card.colors.text5 = color;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.row}>
            <div class={styles.filler} />
            <div class={styles.filler} />
            <ColorPicker
              label='Text 6'
              color={this.card.colors?.text6 ?? '#000000'}
              onchange={(color) => {
                this.card.colors.text6 = color;
                this._onchange();
              }}
            />
          </div>
        </Tab>
        <Tab label='TEXT'>
          <div class={styles.row}>
            <Input
              label='Inactive Message'
              // maxlength={MAX_CARD_NAME}
              value={this.card.text.gameOverTitle}
              oninput={(e) => {
                this.card.text.gameOverTitle = e.target.value;
                this._onchange();
              }}
            />
          </div>
          <div class={styles.row}>
            <Input
              label='Inactive Submessage'
              // maxlength={MAX_CARD_NAME}
              value={this.card.text.gameOverSubtitle}
              oninput={(e) => {
                this.card.text.gameOverSubtitle = e.target.value;
                this._onchange();
              }}
            />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
