import axios from 'axios';
import { api } from './api';
import { uuid } from '@gamechangerinteractive/xc-backend/utils';

export const CLEANSPEAK_URL = 'https://xcite-test-cleanspeak-api.inversoft.io/content/item/moderate';
export const CLEANSPEAK_CHAT_APPLICATION_ID = '3dc290d8-0004-4549-849f-a7bc290e522e';
export const CLEANSPEAK_USERNAME_APPLICATION_ID = 'dd7cc8a6-ecba-49a3-955d-4ec0b5b2bab1';
export const CLEANSPEAK_API_KEY = 'LXJyV--vPyDkAfnC9-W1BrocL_AiTWA4_IBBPNPedl0';

class FilterService {
  public async isCleanChat(message: string): Promise<boolean> {
    const body = this.generateBody(message, CLEANSPEAK_CHAT_APPLICATION_ID);
    return await this.postMessage(body);
  }

  public async isCleanUsername(username: string): Promise<boolean> {
    const body = this.generateBody(username, CLEANSPEAK_USERNAME_APPLICATION_ID);
    return await this.postMessage(body);
  }

  private generateBody(payload: string, appId: string): any {
    return {
      content: {
        applicationId: appId,
        createInstant: api.time(),
        parts: [
          {
            content: payload,
            type: 'text',
          },
        ],
        // As we are not storing anything, and I don't want to send phone numbers
        // if I don't have to, this is just a random UUID.
        senderId: uuid(),
      },
    };
  }

  private async postMessage(messageBody: any): Promise<boolean> {
    try {
      const response = await axios.post(CLEANSPEAK_URL, messageBody, {
        headers: {
          Authorization: CLEANSPEAK_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      return response.data.contentAction === 'allow';
    } catch (e) {
      const message: string = e?.response?.data?.errmsg;

      if (message) {
        throw new Error(message);
      } else {
        throw e;
      }
    }
  }
}

export const filterService = new FilterService();
