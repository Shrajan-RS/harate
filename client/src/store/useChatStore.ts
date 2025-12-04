import { create } from 'zustand';
import { Chat, Message, resolveId } from '../types';

type MessageMap = Record<string, Message[]>;

type ChatState = {
  chats: Chat[];
  activeChat: Chat | null;
  messages: MessageMap;
  typingMap: Record<string, string[]>;
  onlineUsers: Record<string, boolean>;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chat: Chat | null) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  setOnlineStatus: (userId: string, isOnline: boolean) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChat: null,
  messages: {},
  typingMap: {},
  onlineUsers: {},
  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
  addMessage: (chatId, message) =>
    set((state) => {
      const existing = state.messages[chatId] || [];
      const updatedMessages = [...existing, message];
      const chats = state.chats.map((chat) =>
        resolveId(chat) === chatId ? { ...chat, lastMessage: message } : chat,
      );
      return { messages: { ...state.messages, [chatId]: updatedMessages }, chats };
    }),
  setTyping: (chatId, userId, isTyping) =>
    set((state) => {
      const chatTyping = state.typingMap[chatId] || [];
      const updated = isTyping
        ? Array.from(new Set([...chatTyping, userId]))
        : chatTyping.filter((id) => id !== userId);
      return { typingMap: { ...state.typingMap, [chatId]: updated } };
    }),
  setOnlineStatus: (userId, isOnline) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: isOnline },
    })),
}));

