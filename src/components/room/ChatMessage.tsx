import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  username: string;
  message: string;
  timestamp: Date;
  isOwn?: boolean;
  avatarUrl?: string; // Optional avatar URL
  onReply?: () => void; // Optional reply action
  onDelete?: () => void; // Optional delete action
  onEdit?: () => void; // Optional edit action
}

export function ChatMessage({
  username,
  message,
  timestamp,
  isOwn = false,
  avatarUrl,
  onReply,
  onDelete,
  onEdit,
}: ChatMessageProps) {
  return (
    <div
      className={`px-4 py-2 hover:bg-netflix-gray/50 ${
        isOwn ? 'bg-netflix-gray/20' : ''
      } transition-colors`}
    >
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div className="w-8 h-8 rounded bg-netflix-red flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-full h-full rounded object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-white">
              {username.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-white truncate">{username}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-300 break-words">{message}</p>

          {/* Message Actions */}
          <div className="flex items-center gap-2 mt-1">
            {onReply && (
              <button
                onClick={onReply}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Reply"
              >
                Reply
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Edit"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Delete"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}