import { EditTarget } from './index';
import styles from './module.scss';
import m from 'mithril';
import {
  TargetType,
  ICard,
  ISignupField,
  IMultipleChoiceSignupField,
  CardType,
  ITextPollCard,
  ITriviaCard,
  IImagePollCard,
  ISliderCard,
  ITargetEntry,
  ITeamConfig,
} from '../../../../../../../common/common';
import { validURL } from '../../../../utils';
import { Card } from '../../../card';

export function template(this: EditTarget) {
  return (
    <div class={styles.control}>
      <div class={styles.header}>
        <span>Target Type</span>
        <select onchange={this.targetTypeChangeHandler.bind(this)}>
          {this.targetTypes.map((type) => (
            <option value={type} selected={type === this.card.targetType}>
              {getTargetName(type)}
            </option>
          ))}
        </select>
        <span>{getTargetName(this.card.targetType)}</span>
        {getTargetsSelect.call(this)}
      </div>
      <div class={styles.groupEntries}>{getEntries.call(this)}</div>
    </div>
  );
}

function getTargetsSelect(this: EditTarget) {
  switch (this.card.targetType) {
    case TargetType.SIGNUP:
      return getSignupFieldsSelect.call(this);
    case TargetType.CARD:
      return getCardFieldsSelect.call(this);
    case TargetType.TEAM:
      return getTeamFieldsSelect.call(this);
  }
}

function getCardFieldsSelect(this: EditTarget) {
  return (
    <select onchange={(e) => (this.card.target = this.channelCards[(e.target as HTMLSelectElement).selectedIndex])}>
      {this.channelCards.map((card) => (
        <option selected={(this.card.target as ICard)?.name === card.name}>{card.name}</option>
      ))}
    </select>
  );
}

function getSignupFieldsSelect(this: EditTarget) {
  return (
    <select onchange={(e) => (this.card.target = this.signupFields[(e.target as HTMLSelectElement).selectedIndex])}>
      {this.signupFields.map((field) => (
        <option selected={(this.card.target as ISignupField)?.name === field.name}>{field.name}</option>
      ))}
    </select>
  );
}

function getTeamFieldsSelect(this: EditTarget) {
  return (
    <select onchange={(e) => (this.card.target = this.teams[(e.target as HTMLSelectElement).selectedIndex])}>
      {this.signupFields.map((field) => (
        <option selected={(this.card.target as ITeamConfig)?.name === field.name}>{field.name}</option>
      ))}
    </select>
  );
}

function getEntries(this: EditTarget) {
  if (!this.card.target) {
    return;
  }

  let relations: string[] = [];

  switch (this.card.targetType) {
    case TargetType.SIGNUP:
      relations = (this.card.target as IMultipleChoiceSignupField).options;
      break;
    case TargetType.CARD:
      const card: ICard = this.card.target as ICard;

      switch (card.type) {
        case CardType.REACTION_THUMBS: {
          relations = ['UP', 'DOWN'];
          break;
        }
        case CardType.POLL: {
          const c: ITextPollCard = card as ITextPollCard;
          relations = c.answers;
          break;
        }
        case CardType.TRIVIA: {
          const c: ITriviaCard = card as ITriviaCard;
          relations = c.answers.map((item) => item.value);
          break;
        }
        case CardType.TRIVIA_IMAGE:
        case CardType.POLL_IMAGE: {
          const c: IImagePollCard = card as IImagePollCard;
          relations = c.answers.map((item) => item.url);
          break;
        }
        case CardType.REACTION_SLIDER: {
          const c: ISliderCard = card as ISliderCard;
          relations = c.labels;
          break;
        }
        default:
          {
            // TODO: implement the rest cards
            console.warn('unsupported card type:', card);
            break;
          }
          break;
      }
      break;
    case TargetType.TEAM: {
      relations = this.teams.map((t) => t.name);
      break;
    }
  }

  return relations.map((relation, index) => {
    const entry: ITargetEntry = this.card.entries.find((item) => item.relation === relation);
    const isUrl: boolean = validURL(relation);

    return (
      <div class={styles.row}>
        <div class={styles.index}>{(index + 1).toString().padStart(2, '0')}</div>
        {!isUrl && <div class={styles.option}>{relation}</div>}
        {isUrl && <div class={styles.image} style={{ backgroundImage: `url(${relation})` }}></div>}
        {!!entry && (
          <Card
            card={entry.card}
            channel={this._channel}
            onedit={this.cardEditHandler.bind(this, entry.card)}
            ondelete={this.cardDeleteHandler.bind(this, index)}
          />
        )}
        {!entry && <div class={styles.labelSkip}>SKIP or</div>}
        {!entry && <button onclick={this.buttonAddCardHandler.bind(this, relation)}>ADD CARD</button>}
      </div>
    );
  });
}

function getTargetName(type: TargetType): string {
  switch (type) {
    case TargetType.SIGNUP: {
      return 'SignUp Field';
    }
    case TargetType.CARD: {
      return 'Card';
    }
    case TargetType.TEAM: {
      return 'Team';
    }
  }

  return `Unknown target type: ${type}`;
}
