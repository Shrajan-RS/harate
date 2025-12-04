import { Chat, User, resolveId } from '../types';

export const getChatPartner = (chat: Chat, userId?: string | null): User | null => {
  if (chat.isGroup) return null;
  return chat.users.find((user) => resolveId(user) !== userId) || null;
};

export const getChatName = (chat: Chat, userId?: string | null) => {
  if (chat.isGroup) return chat.chatName || 'Group chat';
  return getChatPartner(chat, userId)?.name || 'Direct chat';
};

export const getChatAvatar = (chat: Chat, userId?: string | null) => {
  if (chat.isGroup) return chat.chatName.charAt(0).toUpperCase();
  const partner = getChatPartner(chat, userId);
  return partner?.name?.charAt(0).toUpperCase() || 'H';
};

