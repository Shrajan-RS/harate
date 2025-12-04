import clsx from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import { Chat, resolveId } from '../../types';
import { getChatName, getChatPartner } from '../../utils/chat';

type Props = {
  chat: Chat;
  isActive: boolean;
  currentUserId?: string | null;
  onlineUsers: Record<string, boolean>;
  onSelect: (chat: Chat) => void;
};

const ChatListItem = ({ chat, isActive, currentUserId, onlineUsers, onSelect }: Props) => {
  const partner = getChatPartner(chat, currentUserId || undefined);
  const isOnline = partner ? onlineUsers[resolveId(partner)] : false;

  const timestamp = chat.lastMessage?.createdAt || chat.updatedAt;

  return (
    <button
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
        isActive ? 'bg-brand-primary/20' : 'hover:bg-slate-700/30',
      )}
      onClick={() => onSelect(chat)}
    >
      <div className="relative">
        {chat.isGroup || !partner?.profilePic ? (
          <div className="w-12 h-12 rounded-full bg-brand-primary/30 text-brand-primary flex items-center justify-center font-semibold">
            {(chat.isGroup ? chat.chatName : partner?.name || 'H').charAt(0)}
          </div>
        ) : (
          <img
            src={partner.profilePic}
            alt={partner.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        {isOnline && <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-white font-medium truncate">{getChatName(chat, currentUserId || undefined)}</p>
        <p className="text-sm text-slate-400 truncate">
          {chat.lastMessage
            ? chat.lastMessage.type === 'image'
              ? '📷 Photo'
              : chat.lastMessage.content
            : 'Start a conversation'}
        </p>
      </div>
      <div className="text-xs text-slate-500">
        {timestamp
          ? formatDistanceToNowStrict(new Date(timestamp), { addSuffix: false })
          : ''}
      </div>
    </button>
  );
};

export default ChatListItem;

