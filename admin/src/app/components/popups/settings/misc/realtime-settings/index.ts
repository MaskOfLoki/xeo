import { template } from './template';
import { ClassComponent, Vnode } from 'mithril';
import Swal from 'sweetalert2';
import Ajv from 'ajv';
import { IChannelStateAttrs } from '../../../../../utils/ChannelStateComponent';
import { IChannel, IConfig, IMarketingMessage } from '../../../../../../../../common/common';
import { toPromise } from '../../../../../utils';
import { api } from '../../../../../services/api';
import { fileService } from '../../../../../services/FileService';
import { loading } from '../../../../../../../../common/loading';

export interface IRealTimeSettings extends IChannelStateAttrs {
  onconfigimport: () => void;
}

export interface IExportData {
  config: IConfig;
  state?: {
    marketingMessages: IMarketingMessage[];
  };
}

export class RealTimeSettings implements ClassComponent<IRealTimeSettings> {
  private _channel: IChannel;
  private _onConfigImport: () => void;

  public oninit({ attrs }: Vnode<IRealTimeSettings>) {
    this._onConfigImport = attrs.onconfigimport;
  }

  public async buttonExportSettingsHandler() {
    const channelId = this._channel?.id ?? 'common';

    const data: IExportData = {
      config: await toPromise(api.config(channelId)),
    };
    const { marketingMessages } = await toPromise(api.state(channelId));
    if (marketingMessages) {
      data.state = { marketingMessages };
    }
    const blob = new Blob([JSON.stringify(data)], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${this._channel?.name ?? 'Global'} Settings.json`);
  }

  public async buttonImportSettingsHandler() {
    const file: File = await fileService.select('.json');

    if (!file) {
      return;
    }

    const content: string = await fileService.readFileAsText(file);

    try {
      const data: IExportData = JSON.parse(content);
      const schema = await loading.wrap(import('../../../../../../../../common/schemas/config.json'));
      const ajv = new Ajv();
      const valid = ajv.validate(schema, data.config);
      const channelId = this._channel?.id ?? 'common';

      if (!valid) {
        throw ajv.errors;
      }

      if (this._channel?.id || this._channel?.id === '') {
        delete data.config.misc;
      }

      if (data.state?.marketingMessages) {
        const saveAllMarketMessages = Promise.all(
          data.state.marketingMessages.map((msg) => api.saveMarketingMessage(msg, channelId)),
        );

        await loading.wrap(saveAllMarketMessages);
      }

      api.markAdminAction('SETTINGS IMPORT', { namespace: channelId });

      await loading.wrap(api.setConfig(data.config, channelId));
      if (this._onConfigImport) {
        this._onConfigImport();
      }
    } catch (e) {
      console.warn('MiscSettings.buttonImportSettingsHandler error', e);
      Swal.fire({
        icon: 'error',
        title: 'Invalid settings file',
      });
    }
  }

  public view({ attrs }: Vnode<IChannelStateAttrs>) {
    this._channel = attrs.channel;
    return template.call(this, attrs);
  }
}
