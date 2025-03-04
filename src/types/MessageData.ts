import { UserData } from "./UserData";

export interface MessageData {
  id: number;
  title: string;
  description: string;
  status: string;
  sender: UserData;
  recipient: UserData;
  createdAt: string;
}

export interface SendMessageData {
  title: string;
  description: string;
  recipients: number[];
}
