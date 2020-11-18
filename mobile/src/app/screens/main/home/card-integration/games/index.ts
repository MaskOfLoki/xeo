import { PGPIntegrationScreen } from './predictive-platform';
import { HatShuffleIntegrationScreen } from './hat-shuffle';
import { SkeeballIntegrationScreen } from './skeeball';
import { QBTossIntegrationScreen } from './qb-toss';
import { PopAShotIntegrationScreen } from './pop-a-shot';
import { config as configService } from '../../../../../services/ConfigService';
import { GAME_CONFIG_FIELDS } from '../../../../../../../../common/constants/arcade';
import { TOWIntegrationScreen } from './tug-of-war';
import { FFCIntegrationScreen } from './fan-filter-cam';
import { TurboTrivia2Screen } from './turbo-trivia-2';
import { BingoIntegrationScreen } from './bingo';

export { PGPIntegrationScreen };
export { HatShuffleIntegrationScreen };
export { SkeeballIntegrationScreen };
export { QBTossIntegrationScreen };
export { PopAShotIntegrationScreen };
export { TOWIntegrationScreen };
export { FFCIntegrationScreen };
export { TurboTrivia2Screen };
export { BingoIntegrationScreen };

export function fillDefaultGameConfig(config: any, gameId: string): any {
  if (!config) {
    config = {};
  }

  if (!config.colors) {
    config.colors = {};
  }

  if (!config.images) {
    config.images = {};
  }

  const defaults = GAME_CONFIG_FIELDS[gameId];

  if (defaults) {
    const colors = defaults.colors.values || [];
    for (const color of colors) {
      if (!config.colors[color.key]) {
        if ((color.default as string).startsWith('#')) {
          config.colors[color.key] = color.default;
        } else {
          config.colors[color.key] = configService.getConfig(color.default);
        }
      }
    }

    if (defaults.text) {
      const texts = defaults.text.values || [];
      if (!config.text) {
        config.text = {};
      }

      for (const text of texts) {
        if (!config.text[text.key]) {
          config.text[text.key] = text.default;
        }
      }
    }

    if (defaults.custom) {
      const custom = defaults.custom.values || [];
      if (!config.custom) {
        config.custom = {};
      }

      for (const entry of custom) {
        if (config.custom[entry.key] === undefined) {
          config.custom[entry.key] = getCustomValue(entry);
        }
      }
    }
  }

  config.mode = 'event';

  return config;
}

function getCustomValue(custom) {
  switch (custom.type) {
    case 'switch':
      return custom.options[0];
    case 'number':
    case 'string':
    case 'toggle':
      return custom.default;
  }
}

export function removeColorFunctions(value: any) {
  if (!value) {
    return;
  }

  for (const c in value) {
    if (value[c] == null) {
      continue;
    }

    delete value[c].toString;
  }
}
