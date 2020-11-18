import { ArcadeGameScreen } from '..';
import { IUser, IConfig } from '../../../../../../../../common/common';
import { Vnode } from 'mithril';

export class BingoGameScreen extends ArcadeGameScreen {
  public oninit(_vnode: Vnode) {
    super.oninit(_vnode);
    this._gameId = 'bingo';
  }

  // eslint-disable-next-line
  protected async sendUserData(data: IUser): Promise<void> { }

  // eslint-disable-next-line
  protected sendConfigData(data: IConfig): void { }
}
