export const GAME_CONFIG_FIELDS = {
  'fan-filter-cam': {
    prefix: 'fan-filter-cam',
    colors: {},
    custom: {
      prefix: 'custom',
      values: [
        {
          key: 'filter-1',
          label: 'Emoji Filter',
          type: 'toggle',
          default: true,
        },
        {
          key: 'filter-2',
          label: 'Animal Filter',
          type: 'toggle',
          default: true,
        },
        // {
        //   key: 'filter-3',
        //   label: 'Facepaint Filter',
        //   type: 'toggle',
        //   default: true,
        // },
      ],
    },
    images: {
      prefix: 'images',
      values: [
        {
          key: 'icon',
          label: 'Game Icon',
        },
      ],
    },
    text: {
      prefix: 'text',
      values: [
        {
          key: 'gameTitle',
          label: 'Game Title',
          limit: 25,
          default: 'Fan Filter Cam',
        },
      ],
    },
  },
  'predictive-platform': {
    prefix: 'predictive-platform',
    custom: {
      prefix: 'custom',
      values: [],
    },
    images: {
      prefix: 'images',
      values: [
        {
          key: 'icon',
          label: 'Game Icon',
        },
      ],
    },
  },
  'turbo-trivia-2': {
    prefix: 'turbo-trivia-2',
    custom: {
      prefix: 'custom',
      values: [],
    },
    images: {
      prefix: 'images',
      values: [
        {
          key: 'icon',
          label: 'Game Icon',
        },
      ],
    },
  },
  bingo: {
    prefix: 'bingo',
    custom: {
      prefix: 'custom',
      values: [],
    },
    images: {
      prefix: 'images',
      values: [
        {
          key: 'icon',
          label: 'Game Icon',
        },
      ],
    },
  },
  'hat-shuffle': {
    prefix: 'hat-shuffle',
    colors: {
      prefix: 'colors',
      values: [
        {
          key: 'primary',
          label: 'Primary',
          default: 'home.colors.background',
        },
        {
          key: 'secondary',
          label: 'Secondary',
          default: 'home.colors.accent',
        },
        {
          key: 'text',
          label: 'Text',
          default: 'home.colors.text',
        },
      ],
    },
    custom: {
      prefix: 'custom',
      values: [
        {
          key: 'backgroundType',
          label: 'Arena',
          type: 'select',
          options: [
            'baseball',
            // 'basketball',
            // 'cricket',
            // 'football',
            // 'hockey',
            // 'soccer',
            // 'tennis',
          ],
        },
        {
          key: 'splashScreenTimer',
          label: 'Splash Screen Countdown',
          type: 'number',
          default: 60,
        },
        {
          key: 'gameStartTimer',
          label: 'Game Start Countdown',
          type: 'number',
          default: 10,
        },
        {
          key: 'revealTimer',
          label: 'Reveal Countdown',
          type: 'number',
          default: 20,
        },
      ],
    },
    images: {
      prefix: 'images',
      values: [
        {
          key: 'icon',
          label: 'Game Icon',
        },
        {
          key: 'backgroundImage',
          label: 'Background Image',
          default: '',
        },
        {
          key: 'ballLogo',
          label: 'Hidden Object Logo',
        },
        {
          key: 'sponsorLogo',
          label: 'Sponsor Logo',
          default: '',
        },
      ],
    },
    text: {
      prefix: 'text',
      values: [
        {
          key: 'gameTitle',
          label: 'Game Title',
          limit: 25,
          default: 'Hat Shuffle',
        },
      ],
    },
  },
  skeeball: {
    prefix: 'skeeball',
    colors: {
      prefix: 'colors',
      values: [
        {
          key: 'primary',
          label: 'Primary',
          default: 'home.colors.background',
        },
        {
          key: 'secondary',
          label: 'Secondary',
          default: 'home.colors.accent',
        },
        {
          key: 'text',
          label: 'Text',
          default: 'home.colors.text',
        },
        {
          key: 'ball',
          label: 'Ball',
          default: 'home.colors.background',
        },
      ],
    },
    custom: {},
    images: {
      prefix: 'images',
      values: [
        {
          key: 'icon',
          label: 'Game Icon',
        },
        {
          key: 'logo',
          label: 'Game Logo',
          default: 'home.images.logo',
        },
        {
          key: 'backgroundImage',
          label: 'Background Image',
          default: '',
        },
        {
          key: 'ballLogo',
          label: 'Hidden Object Logo',
        },
        {
          key: 'sponsorLogo',
          label: 'Sponsor Logo',
          default: '',
        },
      ],
    },
    text: {
      prefix: 'text',
      values: [
        {
          key: 'gameTitle',
          label: 'Game Title',
          limit: 25,
          default: 'Skeeball',
        },
      ],
    },
  },
  'qb-toss': {
    prefix: 'qb-toss',
    colors: {
      prefix: 'colors',
      values: [
        {
          key: 'primary',
          label: 'Primary',
          default: 'home.colors.background',
        },
        {
          key: 'secondary',
          label: 'Secondary',
          default: 'home.colors.accent',
        },
        {
          key: 'text',
          label: 'Text',
          default: 'home.colors.text',
        },
      ],
    },
    custom: {},
    images: {
      prefix: 'images',
      values: [
        {
          key: 'icon',
          label: 'Game Icon',
        },
        {
          key: 'teamLogo',
          label: 'Team Logo',
          default: '',
        },
        {
          key: 'sponsorLogo',
          label: 'Sponsor Logo',
        },
      ],
    },
    text: {
      prefix: 'text',
      values: [
        {
          key: 'gameTitle',
          label: 'Game Title',
          limit: 25,
          default: 'QB Toss',
        },
      ],
    },
  },
  'pop-a-shot': {
    prefix: 'pop-a-shot',
    colors: {
      prefix: 'colors',
      values: [
        {
          key: 'primary',
          label: 'Primary',
          default: 'home.colors.background',
        },
        {
          key: 'secondary',
          label: 'Secondary',
          default: 'home.colors.accent',
        },
        {
          key: 'text',
          label: 'Text',
          default: 'home.colors.text',
        },
        {
          key: 'ball',
          label: 'Ball',
          default: 'home.colors.background',
        },
      ],
    },
    custom: {},
    images: {
      prefix: 'images',
      values: [
        {
          key: 'icon',
          label: 'Game Icon',
        },
      ],
    },
    text: {
      prefix: 'text',
      values: [
        {
          key: 'gameTitle',
          label: 'Game Title',
          limit: 25,
          default: 'QB Toss',
        },
      ],
    },
  },
};
