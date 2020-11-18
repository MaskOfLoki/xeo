import { isAndroid, isIOS } from '@gamechangerinteractive/xc-backend/utils';
import { forcedDevice, isPreview } from '../../../../common/utils/query';

class DeviceService {
  private _isMobile: boolean;

  constructor() {
    if (!isPreview()) {
      this._isMobile = isAndroid() || isIOS();
      if (!this._isMobile) {
        this._isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
          forcedDevice() === 'mobile';
      }
    } else {
      this._isMobile = true;
    }
  }

  public get isMobile() {
    return this._isMobile;
  }

  public get isDesktop() {
    return !this._isMobile;
  }
}

export const deviceService = new DeviceService();
