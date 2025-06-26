export interface User {
  name: string;
  username: string;
}

export interface RoomUser {
  _id: string;
  username: string;
  name: string;
}

export interface Room {
  _id: string;
  ts: string;
  t: string;
  name: string;
  usernames: string[];
  msgs: number;
  usersCount: number;
  _updatedAt: string;
  u: RoomUser;
  default?: boolean;
  rolePrioritiesCreated?: number;
}

export interface MessageAttachment {
  title?: string;
  title_link?: string;
  text?: string;
  color?: string;
  image_url?: string;
}

export interface Message {
  id: string;
  text?: string;
  user: User;
  timestamp: string;
  type?: string;
  attachments?: MessageAttachment[];
}

export interface VideoCallData {
  roomId: string;
  meetingRoom: string;
  username?: string;
  timestamp: string;
}
