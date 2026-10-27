import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../hooks/useChat';
import { SUGGESTED_QUESTIONS } from '../data/suggestions';
import { MessageBubble } from './MessageBubble';
import { SparkIcon } from './Icons';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  canRetry: boolean;
  onSend: (question: string) => void;
  onRetry: () => void;
}

function TypingIndicator() {
  return (
    <div className="message message--assistant message--typing">
      <span className="message__avatar" aria-hidden="true">
        <SparkIcon size={16} />
      </span>
      <div className="message__bubble typing" aria-label="Asisten sedang menulis">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  isLoading,
  canRetry,
  onSend,
  onRetry,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isLoading]);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <section
      className="messages"
      aria-live="polite"
      aria-busy={isLoading}
      aria-label="Riwayat percakapan"
    >
      {isEmpty ? (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">
            <SparkIcon size={26} />
          </span>
          <h2>Mulai bertanya tentang layanan kampus</h2>
          <p>
            Jawaban diambil langsung dari dokumen praktikum. Setiap jawaban
            menyertakan penanda sumber seperti <span className="citation">D2</span>{' '}
            yang bisa kamu buka di bawah balasan.
          </p>

          <div className="empty-state__chips">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                className="chip"
                type="button"
                key={question}
                onClick={() => onSend(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            canRetry={canRetry && message.id === messages[messages.length - 1]?.id}
            isRetrying={isLoading}
            onRetry={onRetry}
          />
        ))
      )}

      {isLoading ? <TypingIndicator /> : null}
      <div ref={endRef} className="messages__end" />
    </section>
  );
}
