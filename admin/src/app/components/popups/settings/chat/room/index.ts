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

export interface IChatroomSettings extends IChannelStateAttrs {
  onconfigimport: () => void;
}

export interface IExportData {
  config: IConfig;
  state?: {
    marketingMessages: IMarketingMessage[];
  };
}

export class ChatroomSettings implements ClassComponent<IChatroomSettings> {
  public view({ attrs }: Vnode<IChannelStateAttrs>) {
    return template.call(this, attrs);
  }
}
