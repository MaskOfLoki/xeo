import { cloneObject, uuid } from '@gamechangerinteractive/xc-backend/utils';
import { api } from './api';

class FileService {
  private _input: HTMLInputElement;

  public async select(accept: string): Promise<File> {
    const files = await this.selectFiles(accept);
    return files[0];
  }

  public async selectMulti(accept: string): Promise<File[]> {
    const files = await this.selectFiles(accept, true);
    return files;
  }

  private async selectFiles(accept = '.png, .jpg, .jpeg, .svg', multi = false): Promise<File[]> {
    if (this._input) {
      this._input.remove();
    }

    this._input = document.createElement('input');
    this._input.type = 'file';
    this._input.multiple = multi;
    this._input.style.position = 'absolute';
    this._input.style.opacity = '0';
    this._input.style['pointer-events'] = 'none';
    this._input.accept = accept;

    return new Promise<File[]>((resolve, reject) => {
      const handler = () => {
        this._input.removeEventListener('change', handler);

        if (this._input.files.length === 0) {
          reject('nothing was selected');
          return;
        }

        const files: File[] = [];
        for (let i = 0; i < this._input.files.length; ++i) {
          files.push(this._input.files.item(i));
        }
        resolve(files);
        this._input.value = null;
      };

      this._input.addEventListener('change', handler);
      this._input.click();
    });
  }

  public readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  public upload(file: File): Promise<string> {
    const ref = uuid() + sanitizeFileName(file.name);
    return api.uploadFile(ref, file);
  }

  public delete(url: string): Promise<void> {
    return api.deleteFile(url);
  }
}

export const fileService: FileService = new FileService();

function sanitizeFileName(value: string): string {
  value = value.split(' ').join('');
  value = value.split('(').join('');
  value = value.split(')').join('');
  return value;
}
