import { ISnapshot, SnapshotType } from './models';

export interface ISnapshotService {
  create<T>(type: SnapshotType, data: T): Promise<void>;

  get<T>(type: SnapshotType): Promise<Array<ISnapshot<T>>>;

  remove(id: string): Promise<void>;
}
