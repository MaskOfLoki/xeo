type ProgressCallback = (completed: number, total: number) => void;

export interface IExecutionQueueOptions {
  callback?: ProgressCallback;
  destructive?: boolean;
}

export class ExecutionQueue<T extends void | boolean = void> {
  private _queue: Array<() => Promise<T>> = [];

  public push(entry: () => Promise<T>): void {
    this._queue.push(entry);
  }

  public async run(options: IExecutionQueueOptions = {}): Promise<T> {
    let result: T;
    let completed = 0;
    const total = this._queue.length;

    // Only run while entries exist
    while (this._queue.length) {
      // Attempt to run the entry
      try {
        result = await this._queue[0]();
        completed++;
      } catch (e) {
        console.error(e);
        if (options.destructive) {
          this._queue = [];
        }
        throw e;
      }

      // Remove the entry after it has been run
      this._queue.shift();

      // Call the callback if it exists
      if (options.callback) {
        options.callback(completed, total);
      }

      // Continue if a void function or if true
      // Otherwise break out of the loop
      if (typeof result !== 'boolean' || result) {
        continue;
      } else {
        if (options.destructive) {
          this._queue = [];
        }
        break;
      }
    }

    return result;
  }

  public get length(): number {
    return this._queue.length;
  }
}
