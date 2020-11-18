import { IChannel } from '../../../../common/common';
import { api } from '../services/api';

const DAYS_DEFAULT_REMAIN = 15;

export function updateDeleted(channel: IChannel): boolean {
  if (typeof channel.deleted == 'number') {
    return false;
  } else if (typeof channel.deleted == 'boolean') {
    channel.deleted = api.time() - 3600 * 24 * 1000 * DAYS_DEFAULT_REMAIN;
    return true;
  }

  return false;
}
