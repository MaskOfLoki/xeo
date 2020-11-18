import { template } from './template';
import { api } from '../../../services/api';
import { filterService } from '../../../services/FilterService';
import styles from './module.scss';

import { ClassBaseComponent } from '../../../components/class-base';
import { IConfig } from '../../../../../../common/common';
import { IXCChatMessage } from '../../../../../../common/types/IXCChatMessage';
import { config } from '../../../services/ConfigService';
import { redraw } from 'mithril';
import { isEmptyString, isIOS } from '@gamechangerinteractive/xc-backend/utils';
import { swalAlert } from '../../../utils';
import { delay } from '../../../../../../common/utils';
import { IUserGroup, UserGroupType } from '../../../../../../common/common';
import { loading } from '../../../../../../common/loading';
import { filter } from 'rxjs/operators';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

export class ChatScreen extends ClassBaseComponent {
  private _unwatch: VoidFunction;
  private _chatFeedElement: HTMLDivElement;
  private lastChat: IXCChatMessage;
  private _chatMessage: string;
  private _chatReactionPanel: HTMLDivElement;
  private enableChatReaction = false;
  private reactionItems = [undefined, undefined, undefined, undefined, undefined];

  public isBanned = false;
  public isSending: boolean;
  public chatMessage: string;
  public tabs: ITab[] = [
    {
      id: '',
      label: 'Global',
    },
  ];

  public namespace = this.tabs[0].id;

  constructor() {
    super();
    this._subscriptions.push(api.config.pipe(filter((value) => !!value)).subscribe(this.configHandler.bind(this)));
  }

  public oninit(): void {
    api.verifyLeaderboardData();
    this.refreshGroups();
  }

  public oncreate({ dom }) {
    this._chatFeedElement = dom.getElementsByClassName(styles.chatFeed)[0];
    this._subscriptions.push(
      api.chatReaction.subscribe(this.reactionHandler.bind(this)),
      api.banned.subscribe((banned) => {
        this.isBanned = !!banned;
        redraw();
      }),
    );

    Promise.all([api.getMessageReactions(), api.getMessageHistory()]).then((response) => {
      const [reactions, messages] = response;
      messages.map((message) => {
        this.chatHandler(message);
      });
      const reactionsData = reactions.data;
      reactionsData.map((item) => {
        this.reactionHandler(item);
      });
    });

    if (isIOS()) {
      disableBodyScroll(document.querySelector(`.${styles.chatFeed}`));
    }

    // Clicking out side will hide Panel
    document.addEventListener('touchstart', (e) => {
      if (!this.isDescendant(this._chatReactionPanel, e.target)) {
        e.stopPropagation();
        this.hideReactionPanel();
        this._chatReactionPanel = null;
      }
    });

    // Clicking out side will hide Panel
    document.addEventListener('mousedown', (e) => {
      if (!this.isDescendant(this._chatReactionPanel, e.target)) {
        e.stopPropagation();
        this.hideReactionPanel();
        this._chatReactionPanel = null;
      }
    });

    this.tabChangeHandler(this.namespace);
  }

  private async refreshGroups() {
    const groups: IUserGroup[] = await loading.wrap(api.userGroups.getMyGroups());
    const friendsGroup: IUserGroup = groups.find((item) => item.type === UserGroupType.FRIENDS);

    if (friendsGroup && !this.tabs.find((item) => item.label === friendsGroup.type.toUpperCase())) {
      this.tabs.push({
        id: `${friendsGroup.type}-${friendsGroup._id}`,
        label: friendsGroup.type.toUpperCase(),
      });

      redraw();
    }

    const teamsGroup: IUserGroup = groups.find((item) => item.type === UserGroupType.TEAM);

    if (teamsGroup && !this.tabs.find((item) => item.label === teamsGroup.type.toUpperCase())) {
      this.tabs.push({
        id: `${teamsGroup.type}-${teamsGroup._id}`,
        label: teamsGroup.type.toUpperCase(),
      });

      redraw();
    }
  }

  public async tabChangeHandler(value: string) {
    this.isSending = false;
    this._chatFeedElement.innerHTML = '';
    this.namespace = value;

    if (this._unwatch) {
      this._unwatch();
    }

    this._unwatch = await api.chat.watch(this.chatHandler.bind(this), this.namespace);
    const history = await api.chat.getMessageHistory(this.namespace);
    history.forEach(this.chatHandler.bind(this));
    redraw();
  }

  private configHandler(config: IConfig): void {
    let isConfigChanged = false;
    if (this.enableChatReaction !== config.misc?.chat?.enableReaction) {
      this.enableChatReaction = config.misc?.chat?.enableReaction;
      isConfigChanged = true;
    }
    for (let i = 1; i <= 5; i++) {
      if (config.misc?.chat && this.reactionItems[i - 1] !== config.misc?.chat[`reaction${i}`]) {
        this.reactionItems[i - 1] = config.misc?.chat[`reaction${i}`];
        isConfigChanged = true;
      }
    }
    if (isConfigChanged) {
      redraw();
    }
  }

  private hideReactionPanel(): HTMLDivElement {
    if (!this._chatReactionPanel) {
      return;
    }
    this._chatReactionPanel.classList.remove(styles.active);
  }

  private createReactionPanel(value: IXCChatMessage): HTMLDivElement {
    const reactionPanel = document.createElement('div');
    const container = document.createElement('div');
    container.classList.add(styles.reactionPanelBar);
    this.reactionItems.map((item) => {
      if (item) {
        const image = document.createElement('img');
        image.classList.add(styles.reactionImage);
        image.src = item;
        container.appendChild(image);
        image.addEventListener('touchstart', () => {
          api.submitChatReaction(value.timestamp.toString(), item).finally(() => {
            this.hideReactionPanel();
          });
        });
        image.addEventListener('mousedown', () => {
          api.submitChatReaction(value.timestamp.toString(), item).finally(() => {
            this.hideReactionPanel();
          });
        });
      }
    });
    reactionPanel.appendChild(container);
    reactionPanel.classList.add(styles.reactionPanel);
    return reactionPanel;
  }

  private reactionHandler(value: any) {
    if (value.event) {
      value = value.data;
    }
    if (!value.value.startsWith('http')) {
      return;
    }
    const messageId = `${value.messageTimetoken}`;
    const messageContainer = document.getElementById(messageId);
    if (messageContainer) {
      const reactionContainer = messageContainer.lastChild;
      const reactionBarItems = document.querySelectorAll(`[value='${value.messageTimetoken}-${value.value}']`);
      let reactionBarItem = document.getElementById(value.actionTimetoken);
      if (reactionBarItems.length == 0) {
        reactionBarItem = document.createElement('div');
        reactionBarItem.classList.add(styles.reactionBarItem);
        reactionBarItem.setAttribute('value', `${value.messageTimetoken}-${value.value}`);
        const image = document.createElement('img');
        image.src = `${value.value}`;
        image.classList.add(styles.reactionBarImage);
        const counter = document.createElement('div');
        counter.classList.add(styles.reactionBarCount);
        // counter.classList.add(styles.active);
        counter.innerHTML = '1';
        reactionBarItem.appendChild(image);
        reactionBarItem.appendChild(counter);
        reactionContainer.appendChild(reactionBarItem);
      } else {
        reactionBarItem = reactionBarItems[0] as HTMLDivElement;
        const counter = reactionBarItem.lastChild as HTMLDivElement;
        counter.classList.add(styles.active);
        counter.innerHTML = `${parseInt(counter.innerHTML) + 1}`;
      }
    }
  }

  private isDescendant(parent, child) {
    let node = child.parentNode;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  private chatHandler(value: IXCChatMessage) {
    const chatMessage = document.createElement('div');
    chatMessage.classList.add(styles.chatMessage);
    if (this.lastChat?.uid == value.uid) {
      chatMessage.classList.add(styles.sameUser);
    }
    this.lastChat = value;

    const avatarContainer = document.createElement('div');
    avatarContainer.classList.add(styles.avatarContainer);

    const avatar = document.createElement('div');
    avatar.classList.add(styles.chatAvatar);
    if (!isEmptyString(value.avatarUrl)) {
      avatar.style.backgroundImage = `url(${value.avatarUrl})`;
    } else {
      avatar.style.backgroundImage = `url(assets/images/avatars/${(value.avatarId || 0)
        .toString()
        .padStart(2, '0')}.svg)`;
    }
    avatarContainer.appendChild(avatar);

    const timeStamp = document.createElement('div');
    timeStamp.classList.add(styles.timeStamp);
    const date = new Date(value.timestamp);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 ? hours % 12 : 12;
    timeStamp.innerHTML = `${hours}:${date.getMinutes().toString().padStart(2, '0')}${ampm}`;

    const messageContainer = document.createElement('div');
    messageContainer.classList.add(styles.messageContainer);
    messageContainer.id = `${value.timestamp}`;

    const username = document.createElement('div');
    username.classList.add(styles.username);
    username.innerHTML = value.username;

    const message = document.createElement('div');
    message.classList.add(styles.message);
    message.style.backgroundColor = config.home?.colors?.levels[2].toString();
    message.innerHTML = this.strip(value.message);

    const messageHeader = document.createElement('div');
    messageHeader.classList.add(styles.messageHeader);
    messageHeader.appendChild(username);
    messageHeader.appendChild(timeStamp);

    messageContainer.appendChild(messageHeader);
    messageContainer.appendChild(message);

    if (api.uid !== value.uid) {
      message.classList.add(styles.otherUser);
      message.style.backgroundColor = config.home?.colors?.levels[3].toString();
      chatMessage.appendChild(avatarContainer);
      chatMessage.appendChild(messageContainer);
    } else {
      chatMessage.appendChild(messageContainer);
      chatMessage.appendChild(avatarContainer);
    }

    const shouldScroll =
      Math.abs(
        this._chatFeedElement.scrollHeight - this._chatFeedElement.offsetHeight - this._chatFeedElement.scrollTop,
      ) <= 1;

    const reactionPanel = this.createReactionPanel(value);
    this._chatFeedElement.appendChild(reactionPanel);
    this._chatFeedElement.appendChild(chatMessage);
    const reactionContainer = document.createElement('div');
    reactionContainer.classList.add(styles.reactionContainer);
    messageContainer.appendChild(reactionContainer);

    if (shouldScroll) {
      this._chatFeedElement.scrollTop = this._chatFeedElement.scrollHeight;
    }

    // Handle Long Press Event
    let pressTimer;
    message.addEventListener(
      'touchstart',
      (e) => {
        pressTimer = setTimeout(() => {
          clearTimeout(pressTimer);
          this.hideReactionPanel();
          if (reactionPanel == this._chatReactionPanel) {
            this._chatReactionPanel = null;
            return;
          }
          if (this.enableChatReaction) {
            reactionPanel.classList.add(styles.active);
            this._chatReactionPanel = reactionPanel;
            pressTimer = setTimeout(() => {
              if (reactionPanel == this._chatReactionPanel) {
                this.hideReactionPanel();
                this._chatReactionPanel = null;
              }
            }, 5000);
          }
        }, 250);
      },
      true,
    );

    message.addEventListener(
      'mousedown',
      (e) => {
        clearTimeout(pressTimer);
        e.stopPropagation();
        this.hideReactionPanel();
        if (reactionPanel == this._chatReactionPanel) {
          this._chatReactionPanel = null;
          return;
        }
        if (this.enableChatReaction) {
          reactionPanel.classList.add(styles.active);
          this._chatReactionPanel = reactionPanel;
          pressTimer = setTimeout(() => {
            if (reactionPanel == this._chatReactionPanel) {
              this.hideReactionPanel();
              this._chatReactionPanel = null;
            }
          }, 5000);
        }
      },
      true,
    );

    message.addEventListener('touchend', (e) => {
      clearTimeout(pressTimer);
    });

    message.addEventListener('touchcancel', (e) => {
      clearTimeout(pressTimer);
    });
  }

  private async isValidChatMessage(): Promise<boolean> {
    if (isEmptyString(this.chatMessage)) {
      swalAlert({
        icon: 'warning',
        text: 'Please enter a chat message',
      });

      return false;
    }

    this.chatMessage = this.strip(this.chatMessage);

    if (!(await filterService.isCleanChat(this.chatMessage))) {
      swalAlert({
        icon: 'warning',
        text: 'Please submit a family friendly chat message',
      });
      return false;
    }

    return true;
  }

  private strip(html: string): string {
    return new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
  }

  public async submitChatMessage(): Promise<void> {
    if (this.isSending) {
      return;
    }

    this.isSending = true;

    if (!(await this.isValidChatMessage())) {
      this.isSending = false;
      redraw();
      return;
    }

    api.chat.sendMessage(this.chatMessage, this.namespace);
    this.chatMessage = '';
    redraw();
    await delay(5000);
    this.isSending = false;
    redraw();
  }

  public onremove() {
    super.onremove();

    if (this._unwatch) {
      this._unwatch();
      this._unwatch = undefined;
    }
  }

  public view() {
    return template.call(this);
  }
}

interface ITab {
  id: string;
  label: string;
}
