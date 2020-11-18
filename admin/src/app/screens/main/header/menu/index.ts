import { template } from './template';
import './module.scss';
import { ClassComponent, Vnode } from 'mithril';
import basicContext from 'basiccontext';
import { PopupManager } from '../../../../../../../common/popups/PopupManager';
import { IChannelStateAttrs } from '../../../../utils/ChannelStateComponent';
import { IChannel } from '../../../../../../../common/common';
import { fileService } from '../../../../services/FileService';
import Ajv from 'ajv';
import { loading } from '../../../../../../../common/loading';
import Swal from 'sweetalert2';
import { uuid } from '@gamechangerinteractive/xc-backend/utils';
import { delay, removeNulls } from '../../../../../../../common/utils';
import { SettingsPopup } from '../../../../components/popups/settings';
import { MainboardSettingsPopup } from '../../../../components/popups/mainboard';
import { PrizeHoldersPopup } from '../../../../components/popups/prizeholders';
import { DeleteChannelPopup } from '../../../../components/popups/delete-channel';
import * as JSzip from 'jszip';
import { IExportData } from '../../../../components/popups/settings/misc/realtime-settings';
import { api } from '../../../../services/api';
import { toPromise } from '../../../../utils';

interface IMenuAtts extends IChannelStateAttrs {
  onsave: (value: IChannel) => void;
  ondelete: (value: IChannel) => Promise<void>;
  onrestore: (value: IChannel) => Promise<void>;
  ondeleteexpired: () => Promise<void>;
  channels: IChannel[];
}

interface IExportFile {
  name: string;
  contents: Blob;
}

export class Menu implements ClassComponent<IMenuAtts> {
  private _channel: IChannel;
  private _channels: IChannel[];
  private _onsave: (value: IChannel) => void;
  private _ondelete: (value: IChannel) => Promise<void>;
  private _onrestore: (value: IChannel) => Promise<void>;
  private _ondeleteexpired: () => Promise<void>;

  private _items = [
    {
      title: 'LEADERBOARD AND PRIZING',
      fn: this.prizeholdersHandler.bind(this),
    },
    {
      title: 'DELETED CHANNELS',
      fn: this.deletedChannelsHandler.bind(this),
    },
    {
      title: 'GLOBAL SETTINGS',
      fn: this.settingsHandler.bind(this),
    },
    {
      title: 'IMPORT CHANNEL',
      fn: this.importChannelHandler.bind(this),
    },
    {
      title: 'MAINBOARD CONFIGURATION',
      fn: this.mainboardConfigurationHandler.bind(this),
    },
    {
      title: 'EXPORT PROJECT',
      fn: this.exportProjectHandler.bind(this),
    },
    {
      title: 'IMPORT PROJECT',
      fn: this.importProjectHandler.bind(this),
    },
  ];

  private async settingsHandler() {
    let result;
    do {
      result = PopupManager.show(SettingsPopup);
      await delay(1250);
    } while (result === true);
  }

  private async deletedChannelsHandler() {
    if (this._ondeleteexpired) {
      await this._ondeleteexpired();
    }

    await PopupManager.show(DeleteChannelPopup, {
      channels: this._channels,
      ondelete: this._ondelete,
      onrestore: this._onrestore,
    });
  }

  private prizeholdersHandler() {
    PopupManager.show(PrizeHoldersPopup);
  }

  private async importChannelHandler() {
    const file: File = await fileService.select('.json');

    if (!file) {
      return;
    }

    const content: string = await fileService.readFileAsText(file);

    try {
      const data: IChannel = JSON.parse(content);
      removeNulls(data);
      data.id = uuid();
      const schema = await loading.wrap(import('../../../../../../../common/schemas/channel.json'));
      const ajv = new Ajv();
      const valid = ajv.validate(schema, data);

      if (!valid) {
        throw ajv.errors;
      }

      api.markAdminAction('CHANNEL IMPORT', { type: 'GLOBAL ATTEMPT', id: data.id, name: data.name });

      this._onsave(data);
    } catch (e) {
      console.warn('Menu.importChannelHandler error', e);
      Swal.fire({
        icon: 'error',
        title: 'Invalid channel file',
      });
    }
  }

  private async importProjectHandler() {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'WARNING',
      text: 'This will destroy all existing content. Are you sure you want to proceed?',
      showCancelButton: true,
    });

    if (result.dismiss) {
      return;
    }

    const readZip = new JSzip();
    const file: File = await fileService.select('.zip');
    readZip.loadAsync(file).then(async (zip) => {
      const globalSettings = await readZip.file('Global--Settings.json').async('string');

      const promises: Promise<any>[] = [];
      promises.push(this.validateSettings(globalSettings));
      zip.folder('channels').forEach(async (rPath, file) => {
        if (!file.dir) {
          const json = await file.async('string');
          if (!rPath.includes('--Settings.json')) {
            promises.push(this.validateChannel(json));
          } else {
            promises.push(this.validateSettings(json));
          }
        }
      });

      const result = await Promise.all(promises);
      const valid = result.reduce((l, r) => l && r, true);
      if (!valid) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid project file',
        });
        return;
      }

      for (const channel of this._channels) {
        this._ondelete(channel);
      }

      const zipFile = await readZip.loadAsync(file);
      this.importSettings(globalSettings, 'common');
      zipFile.folder('channels').forEach(async (rPath, file) => {
        if (!file.dir) {
          const json = await file.async('string');
          if (!rPath.includes('--Settings.json')) {
            promises.push(this.importChannel(json));
          }
        }
      });

      await Promise.all(promises);

      setTimeout(() => {
        zipFile.folder('channels').forEach(async (rPath, file) => {
          if (!file.dir) {
            const json = await file.async('string');
            if (rPath.includes('--Settings.json')) {
              const channelName = rPath.split('/')[0];
              this.importSettings(json, channelName);
            }
          }
        });
      }, 3000);
    });
  }

  private async exportProjectHandler() {
    const zip = new JSzip();

    const globalSettings = await this.exportSettings('common');
    zip.file(globalSettings.name, globalSettings.contents);

    for (const channel of this._channels) {
      if (!channel.deleted) {
        const channelExport = this.exportChannel(channel);
        const channelSettings = await this.exportSettings(channel.id);

        zip.file(`channels/${channel.name}/${channelExport.name}`, channelExport.contents);
        zip.file(`channels/${channel.name}/${channelSettings.name}`, channelSettings.contents);
      }
    }

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, 'project_export.zip');
    });
  }

  private exportChannel(channel: IChannel) {
    removeNulls(channel);
    const exportFile: IExportFile = {
      name: `${channel.name}.json`,
      contents: new Blob([JSON.stringify(channel)], { type: 'text/plain;charset=utf-8' }),
    };
    return exportFile;
  }

  private async exportSettings(id: string) {
    const data: IExportData = {
      config: await toPromise(api.config(id)),
    };
    const { marketingMessages } = await toPromise(api.state(id));
    if (marketingMessages) {
      data.state = { marketingMessages };
    }
    const exportFile: IExportFile = {
      name: `${this._channels.find((c) => c.id === id)?.name ?? 'Global'}--Settings.json`,
      contents: new Blob([JSON.stringify(data)], { type: 'text/plain;charset=utf-8' }),
    };
    return exportFile;
  }

  private async validateChannel(content: string) {
    const data: IChannel = JSON.parse(content);
    removeNulls(data);
    const schema = await loading.wrap(import('../../../../../../../common/schemas/channel.json'));
    const ajv = new Ajv();
    const valid = ajv.validate(schema, data);

    if (!valid) {
      console.warn('channel data', data);
      console.warn('Menu.validateChannel error', ajv.errors);
      Swal.fire({
        icon: 'error',
        title: 'Invalid channel file',
      });
    }

    return valid;
  }

  private async importChannel(content: string) {
    const data: IChannel = JSON.parse(content);
    try {
      removeNulls(data);
      const schema = await loading.wrap(import('../../../../../../../common/schemas/channel.json'));
      const ajv = new Ajv();
      const valid = ajv.validate(schema, data);

      if (!valid) {
        throw ajv.errors;
      }

      this._onsave(data);
    } catch (e) {
      console.warn('channel data', data);
      console.warn('Menu.importChannel error', e);
      Swal.fire({
        icon: 'error',
        title: 'Invalid channel file',
      });
    }
  }

  private async validateSettings(content: string) {
    const data: IExportData = JSON.parse(content);
    removeNulls(data);
    const schema = await loading.wrap(import('../../../../../../../common/schemas/config.json'));
    const ajv = new Ajv();
    const valid = ajv.validate(schema, data.config);

    if (!valid) {
      console.warn('channel data', data);
      console.warn('Menu.validateSettings error', ajv.errors);
      Swal.fire({
        icon: 'error',
        title: 'Invalid settings file',
      });
    }

    return valid;
  }

  private async importSettings(content: string, channelName: string) {
    const channel = this._channels.find((c) => c.name === channelName);
    const data: IExportData = JSON.parse(content);
    try {
      const schema = await loading.wrap(import('../../../../../../../common/schemas/config.json'));
      const ajv = new Ajv();
      const valid = ajv.validate(schema, data.config);
      const channelId = channel?.id ?? 'common';

      if (!valid) {
        throw ajv.errors;
      }

      if (channel?.id || channel?.id === '') {
        delete data.config.misc;
      }

      if (data.state?.marketingMessages) {
        const saveAllMarketMessages = Promise.all(
          data.state.marketingMessages.map((msg) => api.saveMarketingMessage(msg, channelId)),
        );

        await loading.wrap(saveAllMarketMessages);
      }

      await loading.wrap(api.setConfig(data.config, channelId));
    } catch (e) {
      console.warn('channel data', data);
      console.warn('Menu.ImportSettings error', e);
      Swal.fire({
        icon: 'error',
        title: 'Invalid settings file',
      });
    }
  }

  private mainboardConfigurationHandler() {
    PopupManager.show(MainboardSettingsPopup, { channel: this._channel });
  }

  public clickHandler(e: MouseEvent) {
    basicContext.show(this._items, {
      ...e,
      clientX: e.clientX,
      clientY: window.innerWidth * 0.03,
    });
  }

  public view({ attrs }: Vnode<IMenuAtts>) {
    this._channel = attrs.channel;
    this._channels = attrs.channels;
    this._onsave = attrs.onsave;
    this._ondelete = attrs.ondelete;
    this._ondeleteexpired = attrs.ondeleteexpired;
    this._onrestore = attrs.onrestore;
    return template.call(this);
  }
}
