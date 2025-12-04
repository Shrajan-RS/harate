import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { createGroupChat, searchUsers } from '../../services/chatService';
import { Chat, User, resolveId } from '../../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (chat: Chat) => void;
};

const GroupModal = ({ isOpen, onClose, onCreated }: Props) => {
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    const run = async () => {
      try {
        const data = await searchUsers(query.trim());
        if (active) setResults(data);
      } catch (err) {
        console.error(err);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [query]);

  const handleToggle = (user: User) => {
    setSelected((prev) => {
      const exists = prev.find((u) => resolveId(u) === resolveId(user));
      if (exists) {
        return prev.filter((u) => resolveId(u) !== resolveId(user));
      }
      return [...prev, user];
    });
  };

  const handleCreate = async () => {
    if (!name.trim() || selected.length < 2) {
      setError('Add a group name and at least 2 peers.');
      return;
    }
    try {
      setLoading(true);
      const payload = { name, users: selected.map((user) => resolveId(user)) };
      const chat = await createGroupChat(payload);
      onCreated(chat);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setQuery('');
    setResults([]);
    setSelected([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl p-6 space-y-4 border border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-white font-semibold">New group chat</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        <input
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white"
          placeholder="Search teammates"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="max-h-40 overflow-y-auto space-y-2">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => handleToggle(user)}
              className={clsx(
                'w-full text-left px-4 py-2 rounded-xl border border-slate-700 flex items-center justify-between',
                selected.some((u) => resolveId(u) === resolveId(user))
                  ? 'bg-brand-primary/20'
                  : 'bg-slate-800',
              )}
            >
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <span>
                {selected.some((u) => resolveId(u) === resolveId(user)) ? '✓' : '+'}
              </span>
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((user) => (
              <span
                key={resolveId(user)}
                className="px-3 py-1 bg-brand-primary/30 text-sm text-white rounded-full"
              >
                {user.name}
              </span>
            ))}
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-dark transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create group'}
        </button>
      </div>
    </div>
  );
};

export default GroupModal;

