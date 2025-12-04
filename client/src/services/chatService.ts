import api from './apiClient';
import { Chat, Message, User } from '../types';

export const fetchChats = async () => {
  const { data } = await api.get<Chat[]>('/chats');
  return data;
};

export const accessChat = async (userId: string) => {
  const { data } = await api.post<Chat>('/chats', { userId });
  return data;
};

export const createGroupChat = async (payload: {
  name: string;
  users: string[];
}) => {
  const { data } = await api.post<Chat>('/chats/group', payload);
  return data;
};

export const searchUsers = async (term: string) => {
  const { data } = await api.get<User[]>(`/chats/users/search?term=${term}`);
  return data;
};

export const fetchMessages = async (chatId: string) => {
  const { data } = await api.get<Message[]>(`/messages/${chatId}`);
  return data;
};

export const sendMessage = async (payload: {
  chatId: string;
  content: string;
  type?: 'text' | 'image';
}) => {
  const { data } = await api.post<Message>('/messages', payload);
  return data;
};

export const uploadChatImage = async (file: File) => {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post<{ url: string }>('/messages/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
};

