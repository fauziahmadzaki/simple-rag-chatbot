import type { ChatSource } from '../api/chat';
import type { ChatMessage } from '../hooks/useChat';
import { SourcesPanel } from './SourcesPanel';
import {
  AlertIcon,
  BotIcon,
  RefreshIcon,
  UserIcon,
} from './Icons';

const CITATION_PATTERN = /(\[D\d+\])/g;
const CITATION_MARKER = /^\[D(\d+)\]$/;

interface MessageBubbleProps {
  message: ChatMessage;
  canRetry: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

function AnswerText({
  text,
  sources,
}: {
  text: string;
  sources: ChatSource[];
}) {
  const paragraphs = text.split(/\n{2,}/);

  return (
    <div className="answer">
      {paragraphs.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex}>
          {paragraph.split(CITATION_PATTERN).map((part, partIndex) => {
            const match = CITATION_MARKER.exec(part);

            if (!match) {
              return part;
            }

            const sourceId = Number(match[1]);
            const source = sources.find((item) => item.id === sourceId);

            return (
              <span
                className="citation"
                key={`${paragraphIndex}-${partIndex}`}
                title={source ? source.text : `Sumber D${sourceId}`}
              >
                D{sourceId}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}

export function MessageBubble({
  message,
  canRetry,
  isRetrying,
  onRetry,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isCancelled = message.status === 'cancelled';

  const rowClassName = [
    'message',
    isUser ? 'message--user' : 'message--assistant',
    isError ? 'message--error' : '',
    isCancelled ? 'message--cancelled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClassName}>
      <span className="message__avatar" aria-hidden="true">
        {isUser ? <UserIcon size={17} /> : <BotIcon size={17} />}
      </span>

      <div className="message__body">
        <div className="message__bubble">
          {isError ? (
            <div className="message__error">
              <AlertIcon size={18} />
              <div>
                <p>{message.content}</p>
                {canRetry ? (
                  <button
                    className="message__retry"
                    type="button"
                    onClick={onRetry}
                    disabled={isRetrying}
                  >
                    <RefreshIcon size={14} />
                    {isRetrying ? 'Mencoba…' : 'Coba lagi'}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <AnswerText text={message.content} sources={message.sources} />
          )}
        </div>

        {!isUser && !isError ? (
          <SourcesPanel sources={message.sources} />
        ) : null}
      </div>
    </div>
  );
}
