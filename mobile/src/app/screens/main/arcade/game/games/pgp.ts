import { ArcadeGameScreen } from '..';
import { IUser, IConfig } from '../../../../../../../../common/common';
import { Vnode } from 'mithril';

export class PGPGameScreen extends ArcadeGameScreen {
  public oninit(_vnode: Vnode) {
    super.oninit(_vnode);
    this._gameId = 'predictive-platform';
  }

  // eslint-disable-next-line
  protected async sendUserData(data: IUser): Promise<void> { }


  // eslint-disable-next-line
  protected sendConfigData(data: IConfig): void { }
}
