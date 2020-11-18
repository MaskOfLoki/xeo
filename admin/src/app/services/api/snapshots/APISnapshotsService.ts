import { ISnapshotService } from './ISnapshotService';
import { ISnapshot, SnapshotType } from './models';

export class APISnapshotsService implements ISnapshotService {
  constructor(private _service: ISnapshotService) {}

  public create<T>(type: SnapshotType, data: T): Promise<void> {
    return this._service.create(type, data);
  }

  public get<T>(type: SnapshotType): Promise<Array<ISnapshot<T>>> {
    return this._service.get(type);
  }

  public remove(id: string): Promise<void> {
    return this._service.remove(id);
  }
}
