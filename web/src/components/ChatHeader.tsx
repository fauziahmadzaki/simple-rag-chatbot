import { ChatLogoIcon, TrashIcon } from './Icons';

interface ChatHeaderProps {
  canClear: boolean;
  onClear: () => void;
}

export function ChatHeader({ canClear, onClear }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="chat-header__identity">
        <span className="chat-header__mark" aria-hidden="true">
          <ChatLogoIcon size={20} />
        </span>
        <div>
          <h2 className="chat-header__title">Ruang Percakapan</h2>
          <p className="chat-header__subtitle">
            RAG · 3 chunk konteks per jawaban
          </p>
        </div>
      </div>

      <button
        className="ghost-button"
        type="button"
        onClick={onClear}
        disabled={!canClear}
        title="Bersihkan percakapan"
      >
        <TrashIcon size={16} />
        <span>Bersihkan</span>
      </button>
    </header>
  );
}
