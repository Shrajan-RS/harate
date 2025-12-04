export type WithId = {
  _id?: string;
  id?: string;
};

export const resolveId = (entity?: WithId | null) =>
  entity?.id || entity?._id || '';

export type User = WithId & {
  name: string;
  email: string;
  profilePic?: string;
  status?: string;
  lastSeen?: string;
};

export type Message = WithId & {
  chat: Chat;
  sender: User;
  content: string;
  type: 'text' | 'image';
  createdAt: string;
};

export type Chat = WithId & {
  chatName: string;
  isGroup: boolean;
  users: User[];
  groupAdmin?: User;
  lastMessage?: Message;
  updatedAt: string;
};

