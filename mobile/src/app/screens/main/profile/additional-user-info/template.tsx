import { AdditionalUserInfoScreen } from './index';
import styles from './module.scss';
import m, { route } from 'mithril';
import { Input } from '../../../../components/input';
import { Button } from '../../../../components/button';
import { config } from '../../../../services/ConfigService';
import { SignupFieldType, IMultipleChoiceSignupField } from '../../../../../../../common/common';
import cn from 'classnames';
import { TextArea } from '../../../../components/textarea';

export function template(this: AdditionalUserInfoScreen) {
  return (
    <div class={cn(styles.screen, { [styles.hasChannelVideo]: this.hasChannelVideo })}>
      <div
        class={styles.gameLogo}
        style={{
          backgroundImage: config.home.images?.headerLogo ? `url(${config.home.images?.headerLogo})` : '',
        }}
      ></div>
      <div class={styles.title}>Just a few more questions</div>
      {this.fields.map((field) => (
        <div class={styles.groupCommon}>
          <span class={styles.inputLabel}>{field.name}</span>
          {field.type === SignupFieldType.STRING && (
            <TextArea
              maxlength='1000'
              value={this.values[field.name]}
              oninput={(e) => (this.values[field.name] = e.target.value)}
            />
          )}
          {field.type === SignupFieldType.MULTIPLE_CHOICE && (
            <select
              style={{
                background: config.home.colors.field,
                color: config.home.colors.text,
              }}
              value={this.values[field.name]}
              onchange={(e) => (this.values[field.name] = e.target.value)}
            >
              {(field as IMultipleChoiceSignupField).options.map((value, index) => (
                <option
                  value={value}
                  selected={this.values[field.name] === value || (this.values[field.name] === undefined && index === 0)}
                >
                  {value}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
      <div class={styles.buttonWrapper}>
        <Button disabled={!this.isSaveAvailable} onclick={this.buttonSaveHandler.bind(this)}>
          SAVE
        </Button>
        <Button onclick={this.buttonCancelhandler.bind(this)}>
          {route.get().includes('profile') ? 'CANCEL' : 'NOT RIGHT NOW'}
        </Button>
      </div>
    </div>
  );
}
