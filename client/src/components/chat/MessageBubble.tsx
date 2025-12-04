import clsx from 'clsx';
import { format } from 'date-fns';
import { Message } from '../../types';

type Props = {
  message: Message;
  isOwn: boolean;
};

const MessageBubble = ({ message, isOwn }: Props) => {
  return (
    <div className={clsx('flex gap-3', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm border border-slate-700/40',
          isOwn ? 'bg-brand-primary text-white' : 'bg-slate-800 text-slate-50',
        )}
      >
        {message.type === 'image' ? (
          <img
            src={message.content}
            alt="shared"
            className="rounded-xl max-h-56 object-cover mb-2"
          />
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
        <p className="text-[11px] text-right opacity-80">
          {format(new Date(message.createdAt), 'HH:mm')}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;

