import { GCWatcher } from './GCWatcher';

export class EventEmitter {
  private readonly _watchers: Map<EventType, GCWatcher> = new Map();

  public on(type: EventType, callback) {
    let watcher = this._watchers.get(type);

    if (!watcher) {
      watcher = new GCWatcher();
      this._watchers.set(type, watcher);
    }

    watcher.watch(callback);
    return () => this.off(type, callback);
  }

  public off(type: EventType, callback?) {
    if (!callback) {
      const watcher = this._watchers.get(type);

      if (watcher) {
        this._watchers.delete(type);
        watcher.clear();
      }

      return;
    }

    const watcher = this._watchers.get(type);

    if (!watcher) {
      return;
    }

    watcher.unwatch(callback);

    if (watcher.length === 0) {
      this._watchers.delete(type);
    }
  }

  public emit(type: EventType, ...args) {
    const watcher = this._watchers.get(type);

    if (!watcher) {
      return;
    }

    watcher.emit(...args);
  }
}

type EventType = string | number;
