import { GCRPC } from '@gamechangerinteractive/xc-backend/GCRPC';
import { gcBackend } from '@gamechangerinteractive/xc-backend';
import ENV from '../../../../common/utils/environment';

export class EmailService extends GCRPC {
  constructor() {
    super(ENV.EMAIL_SERVICE_URL, gcBackend);
  }

  public send(recipients: string[], subject: string, htmlBody: string): Promise<void> {
    return this.call('send', recipients, subject, htmlBody);
  }
}
