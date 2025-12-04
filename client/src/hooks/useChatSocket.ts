import { useEffect } from 'react';
import { connectSocket, disconnectSocket, emitSetup, getSocket } from '../services/socket';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { resolveId } from '../types';

export const useChatSocket = () => {
  const user = useAuthStore((state) => state.user);
  const activeChat = useChatStore((state) => state.activeChat);
  const addMessage = useChatStore((state) => state.addMessage);
  const setTyping = useChatStore((state) => state.setTyping);
  const setOnlineStatus = useChatStore((state) => state.setOnlineStatus);

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket();
    emitSetup({ ...user, id: resolveId(user) });

    socket.on('message_received', (message) => {
      addMessage(resolveId(message.chat), message);
    });
    socket.on('typing', ({ chatId, userId }) => setTyping(chatId, userId, true));
    socket.on('stop_typing', ({ chatId, userId }) =>
      setTyping(chatId, userId, false),
    );
    socket.on('user_online', (userId) => setOnlineStatus(userId, true));
    socket.on('user_offline', (userId) => setOnlineStatus(userId, false));

    return () => {
      socket.off('message_received');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('user_online');
      socket.off('user_offline');
      disconnectSocket();
    };
  }, [user, addMessage, setTyping, setOnlineStatus]);

  useEffect(() => {
    const chatId = resolveId(activeChat);
    if (!chatId) return;
    const socket = getSocket();
    socket?.emit('join_chat', chatId);
  }, [activeChat]);
};

