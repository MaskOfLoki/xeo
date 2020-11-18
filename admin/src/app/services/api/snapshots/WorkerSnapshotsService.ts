import { ISnapshotService } from './ISnapshotService';
import { GCRPC } from '@gamechangerinteractive/xc-backend/GCRPC';
import { ISnapshot, SnapshotType } from './models';
import ENV from '../../../../../../common/utils/environment';
import { gcBackend } from '@gamechangerinteractive/xc-backend';

export class WorkerSnapshotsService extends GCRPC implements ISnapshotService {
  constructor() {
    super(ENV.SNAPSHOTS_URL, gcBackend);
  }

  public create<T>(type: SnapshotType, data: T): Promise<void> {
    return this.call('create', type, data);
  }

  public async get<T>(type: SnapshotType): Promise<Array<ISnapshot<T>>> {
    const result: Array<ISnapshot<T>> = await this.call('get', type);
    result.forEach((item) => (item.createdAt = new Date(item.createdAt)));
    result.sort((s1, s2) => s2.createdAt.getTime() - s1.createdAt.getTime());
    return result;
  }

  public remove(id: string): Promise<void> {
    return this.call('remove', id);
  }
}
