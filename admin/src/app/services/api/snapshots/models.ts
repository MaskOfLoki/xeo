export enum SnapshotType {
  CHANNEL = 'channel',
}

export interface ISnapshot<T> {
  _id?: string;
  cid: string;
  type: SnapshotType;
  createdAt: Date;
  data: T;
}
