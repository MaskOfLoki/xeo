class PreloadService {
  private _promises: Array<Promise<any>> = [];

  public loadImages(paths: string[]): void {
    paths.forEach(this.loadImage.bind(this));
  }

  public loadImage(path: string): void {
    const promise = new Promise((res, rej) => {
      const image = new Image();
      image.onload = res;
      image.onerror = rej;
      image.src = path;
    });
    this._promises.push(promise);
  }

  public async waitForLoad() {
    const promises = this._promises;
    this._promises = [];
    await Promise.all(promises);
  }
}

export const preloadService = new PreloadService();
