export interface IXCChatMessage {
  uid: string;
  username: string;
  avatarId?: number;
  avatarUrl?: string;
  message: string;
  timestamp?: number;
}
