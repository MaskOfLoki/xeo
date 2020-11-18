import {
  ICard,
  IParticipation,
  CardType,
  IThumbsCard,
  IThumbsParticipation,
  ISliderCard,
  ISliderParticipation,
  IImagePollCard,
  IPollParticipation,
  ISounderCard,
  ISounderParticipation,
  ITextPollCard,
  ITriviaCard,
  IApplauseCard,
  IApplauseParticipation,
} from '../../../../../../../../common/common';
import { IParticipationData } from '.';
import { SLIDER_DIVISIONS } from '../../../../../../../../common/constants/cards';
import { Props } from 'tippy.js';
import styles from './module.scss';

export class ParticipationDataFactory {
  public static get(card: ICard, participation: IParticipation): IParticipationData {
    switch (card.type) {
      case CardType.REACTION_THUMBS: {
        return getThumbsParticipation(card as IThumbsCard, participation as IThumbsParticipation);
      }
      case CardType.REACTION_SLIDER: {
        return getSliderParticipation(card as ISliderCard, participation as ISliderParticipation);
      }
      case CardType.TRIVIA_IMAGE:
      case CardType.POLL_IMAGE: {
        return getImagePollParticipation(card as IImagePollCard, participation as IPollParticipation);
      }
      case CardType.POLL: {
        return getTextPollParticipation(card as ITextPollCard, participation as IPollParticipation);
      }
      case CardType.TRIVIA: {
        return getTextTriviaParticipation(card as ITriviaCard, participation as IPollParticipation);
      }
      case CardType.SOUNDER: {
        return getSounderParticipation(card as ISounderCard, participation as ISounderParticipation);
      }
      case CardType.REACTION_APPLAUSE: {
        return getApplauseParticipation(card as IApplauseCard, participation as IApplauseParticipation);
      }
    }
  }
}

function getThumbsParticipation(c: IThumbsCard, p: IThumbsParticipation): IParticipationData {
  return {
    title: 'THUMBS',
    subtitle: c.message,
    total: p.total,
    bars: [
      {
        label: 'UP',
        percentage: getPercentage(p.up, p.total),
        amount: p.up,
      },
      {
        label: 'DOWN',
        percentage: getPercentage(p.down, p.total),
        amount: p.down,
      },
    ],
  };
}

function getApplauseParticipation(c: IApplauseCard, p: IApplauseParticipation): IParticipationData {
  return {
    title: 'APPLAUSE',
    subtitle: c.message,
    total: p.total,
    bars: [
      {
        label: 'CLAPS',
        amount: p.claps,
      },
    ],
  };
}

function getSliderParticipation(c: ISliderCard, p: ISliderParticipation): IParticipationData {
  return {
    title: 'SLIDER',
    total: p.total,
    bars: c.labels.map((label, index) => {
      let answersForLabel = 0;
      const start = index * SLIDER_DIVISIONS;
      const end = start + SLIDER_DIVISIONS;

      for (let i = start; i < end; i++) {
        answersForLabel += p[i] ?? 0;
      }

      return {
        label,
        amount: answersForLabel,
        percentage: getPercentage(answersForLabel, p.total),
      };
    }),
  };
}

function getImagePollParticipation(c: IImagePollCard, p: IPollParticipation): IParticipationData {
  return {
    title: c.type === CardType.POLL_IMAGE ? 'IMAGE POLL' : 'IMAGE TRIVIA',
    subtitle: c.question.label,
    total: p.total,
    bars: c.answers.map((item, index) => {
      const amount = p.answers[index] ?? 0;
      let tooltip: Partial<Props>;

      if (item.url) {
        tooltip = { content: `<img class="${styles.tooltipImage}" src="${item.url}"></img>`, allowHTML: true };
      }

      return {
        label: item.label ?? (index + 1).toString(),
        amount,
        percentage: getPercentage(amount, p.total),
        tooltip,
      };
    }),
  };
}

function getSounderParticipation(c: ISounderCard, p: ISounderParticipation): IParticipationData {
  let totalTaps = 0;
  Object.keys(p.sounds).forEach((item) => (totalTaps += p.sounds[item]));
  return {
    title: 'SOUNDER',
    total: p.total,
    bars: c.sounds.map((sound, index) => {
      const amount = p.sounds[index] ?? 0;
      return {
        label: sound.name,
        amount,
        percentage: getPercentage(amount, totalTaps),
      };
    }),
  };
}

function getTextPollParticipation(c: ITextPollCard, p: IPollParticipation) {
  return {
    title: 'POLL',
    total: p.total,
    bars: c.answers.map((label) => {
      const amount = p.answers[label] ?? 0;
      return {
        label,
        amount,
        percentage: getPercentage(amount, p.total),
      };
    }),
  };
}

function getTextTriviaParticipation(c: ITriviaCard, p: IPollParticipation) {
  if (!p.answers) {
    p.answers = {};
  }

  return {
    title: 'TRIVIA',
    total: p.total,
    bars: c.answers.map((item, index) => {
      const amount = p.answers[item.value] ?? 0;
      return {
        label: item.value ?? (index + 1).toString(),
        amount,
        percentage: getPercentage(amount, p.total),
      };
    }),
  };
}

function getPercentage(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((100 * value) / total);
}
