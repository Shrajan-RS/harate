import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from '../services/authService';
import {
  accessChat,
  fetchChats,
  fetchMessages,
  sendMessage,
  uploadChatImage,
  searchUsers,
} from '../services/chatService';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useChatSocket } from '../hooks/useChatSocket';
import { getSocket } from '../services/socket';
import ChatListItem from '../components/chat/ChatListItem';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import GroupModal from '../components/chat/GroupModal';
import { getChatName, getChatPartner } from '../utils/chat';
import { Chat, User, resolveId } from '../types';

const ChatPage = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const chats = useChatStore((state) => state.chats);
  const setChats = useChatStore((state) => state.setChats);
  const activeChat = useChatStore((state) => state.activeChat);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const messages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const typingMap = useChatStore((state) => state.typingMap);
  const onlineUsers = useChatStore((state) => state.onlineUsers);

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [userResults, setUserResults] = useState<User[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useChatSocket();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user) return;
    const hydrate = async () => {
      try {
        const profile = await fetchProfile();
        setUser(profile);
      } catch {
        logout();
      }
    };
    hydrate();
  }, [token, user, logout, setUser, navigate]);

  useEffect(() => {
    if (!user) return;
    const loadChats = async () => {
      try {
        setLoadingChats(true);
        const data = await fetchChats();
        setChats(data);
        if (data.length && !activeChat) {
          setActiveChat(data[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load chats.');
      } finally {
        setLoadingChats(false);
      }
    };
    loadChats();
  }, [user, setChats, activeChat, setActiveChat]);

  useEffect(() => {
    if (!activeChat) return;
    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const id = resolveId(activeChat);
        if (!id) return;
        const data = await fetchMessages(id);
        setMessages(id, data);
        scrollToBottom();
      } catch {
        setError('Unable to load messages.');
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [activeChat, setMessages]);

  useEffect(() => {
    if (!sidebarSearch.trim()) {
      setUserResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const results = await searchUsers(sidebarSearch.trim());
        setUserResults(results);
      } catch (err) {
        console.error(err);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [sidebarSearch]);

  const activeId = resolveId(activeChat);

  useEffect(() => {
    if (!activeId) return;
    scrollToBottom();
  }, [activeId, messages[activeId]?.length]);

  const filteredChats = useMemo(() => {
    const currentId = resolveId(user);
    if (!sidebarSearch.trim()) return chats;
    return chats.filter((chat) =>
      getChatName(chat, currentId).toLowerCase().includes(sidebarSearch.toLowerCase()),
    );
  }, [chats, sidebarSearch, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!messageInput.trim() || !activeChat) return;
    try {
      setSending(true);
      const chatId = resolveId(activeChat);
      if (!chatId) return;
      const newMessage = await sendMessage({
        chatId,
        content: messageInput.trim(),
      });
      addMessage(chatId, newMessage);
      setMessageInput('');
      notifyStopTyping();
    } catch (err) {
      console.error(err);
      setError('Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  const notifyTyping = () => {
    if (!activeChat || !user) return;
    const socket = getSocket();
    if (!socket) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      const chatId = resolveId(activeChat);
      const userId = resolveId(user);
      if (!chatId || !userId) return;
      socket.emit('typing', { chatId, userId });
    }
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => notifyStopTyping(), 1500);
  };

  const notifyStopTyping = () => {
    if (!activeChat || !user || !isTypingRef.current) return;
    const socket = getSocket();
    const chatId = resolveId(activeChat);
    const userId = resolveId(user);
    if (chatId && userId) {
      socket?.emit('stop_typing', { chatId, userId });
    }
    isTypingRef.current = false;
  };

  const handleMessageInput = (value: string) => {
    setMessageInput(value);
    notifyTyping();
  };

  const handleOpenChat = (chat: Chat) => {
    setActiveChat(chat);
  };

  const pushChatToTop = (chat: Chat) => {
    const targetId = resolveId(chat);
    const filtered = chats.filter((item) => resolveId(item) !== targetId);
    setChats([chat, ...filtered]);
  };

  const handleStartChat = async (target: User) => {
    try {
      const targetId = resolveId(target);
      if (!targetId) return;
      const chat = await accessChat(targetId);
      pushChatToTop(chat);
      setActiveChat(chat);
      setUserResults([]);
      setSidebarSearch('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeChat) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image uploads are allowed.');
      return;
    }
    try {
      setSending(true);
      const url = await uploadChatImage(file);
      const chatId = resolveId(activeChat);
      if (!chatId) return;
      const message = await sendMessage({
        chatId,
        content: url,
        type: 'image',
      });
      addMessage(chatId, message);
    } catch {
      setError('Image upload failed.');
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const typingUsers = activeId ? typingMap[activeId] || [] : [];
  const chatMessages = activeId ? messages[activeId] || [] : [];
  const currentUserId = resolveId(user);
  const partner = activeChat ? getChatPartner(activeChat, currentUserId) : null;
  const partnerOnline = partner ? onlineUsers[resolveId(partner)] : false;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onCreated={(chat) => {
          pushChatToTop(chat);
          setActiveChat(chat);
        }}
      />
      <aside className="w-full max-w-md border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">Harate</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGroupModalOpen(true)}
              className="px-3 py-1 text-sm bg-brand-primary rounded-lg"
            >
              New group
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-slate-400 hover:text-red-400 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <input
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white"
            placeholder="Search chat or user"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
          {userResults.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 max-h-48 overflow-y-auto">
              {userResults.map((result) => (
                <button
                  key={resolveId(result)}
                  onClick={() => handleStartChat(result)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-700/50"
                >
                  <p className="font-medium">{result.name}</p>
                  <p className="text-xs text-slate-400">{result.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-4">
          {loadingChats && <p className="text-center text-slate-500">Loading chats...</p>}
          {filteredChats.map((chat) => (
            <ChatListItem
              key={resolveId(chat)}
              chat={chat}
              isActive={resolveId(activeChat) === resolveId(chat)}
              currentUserId={currentUserId}
              onlineUsers={onlineUsers}
              onSelect={handleOpenChat}
            />
          ))}
        </div>
      </aside>
      <section className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <header className="p-5 border-b border-slate-800 flex items-center gap-4 bg-slate-900/50">
              <div>
                <p className="text-lg font-semibold">{getChatName(activeChat, currentUserId)}</p>
                {!activeChat.isGroup && partner && (
                  <p className="text-sm text-slate-400">
                    {partnerOnline
                      ? 'online'
                      : partner.lastSeen
                      ? `last seen ${formatDistanceToNow(new Date(partner.lastSeen), { addSuffix: true })}`
                      : 'offline'}
                  </p>
                )}
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-950">
              {loadingMessages ? (
                <p className="text-center text-slate-500">Loading messages...</p>
              ) : (
                chatMessages.map((message) => (
                  <MessageBubble
                    key={resolveId(message)}
                    message={message}
                    isOwn={resolveId(message.sender) === currentUserId}
                  />
                ))
              )}
              {typingUsers.length > 0 && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
                >
                  📎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageSelect}
                />
                <textarea
                  className="flex-1 rounded-2xl bg-slate-800 border border-slate-700 px-4 py-3 text-white resize-none h-12"
                  placeholder="Type a message"
                  value={messageInput}
                  onChange={(e) => handleMessageInput(e.target.value)}
                />
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="px-6 py-3 rounded-2xl bg-brand-primary font-semibold disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select or create a chat to get started.
          </div>
        )}
      </section>
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-500/90 text-white px-4 py-2 rounded-xl shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatPage;

