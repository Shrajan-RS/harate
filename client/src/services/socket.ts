import { io, Socket } from 'socket.io-client';
import { User, resolveId } from '../types';

let socket: Socket | null = null;

export const connectSocket = () => {
  if (socket) return socket;
  const url = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
  socket = io(url, {
    transports: ['websocket'],
    withCredentials: true,
  });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const emitSetup = (user: User) => {
  socket?.emit('setup', { id: resolveId(user), name: user.name });
};

export const getSocket = () => socket;

