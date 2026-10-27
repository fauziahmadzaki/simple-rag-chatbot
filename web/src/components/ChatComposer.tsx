import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { MAX_QUESTION_LENGTH } from '../api/chat';
import { SendIcon, StopIcon } from './Icons';

interface ChatComposerProps {
  isLoading: boolean;
  onSend: (question: string) => void;
  onStop: () => void;
}

const MAX_TEXTAREA_HEIGHT = 140;

export function ChatComposer({ isLoading, onSend, onStop }: ChatComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, []);

  useLayoutEffect(() => {
    resizeTextarea();
  }, [value, resizeTextarea]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const submitQuestion = () => {
    const question = value.trim();
    if (question === '' || isLoading) {
      return;
    }
    onSend(question);
    setValue('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitQuestion();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || isComposingRef.current) {
      return;
    }
    event.preventDefault();
    submitQuestion();
  };

  const charactersLeft = MAX_QUESTION_LENGTH - value.length;
  const isNearLimit = charactersLeft <= 60;

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <div className="composer__field">
        <textarea
          ref={textareaRef}
          className="composer__input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
          placeholder="Tulis pertanyaan tentang layanan mahasiswa…"
          rows={1}
          maxLength={MAX_QUESTION_LENGTH}
          aria-label="Pertanyaan"
          disabled={isLoading}
        />

        {isLoading ? (
          <button
            className="composer__action composer__action--stop"
            type="button"
            onClick={onStop}
            aria-label="Hentikan jawaban"
            title="Hentikan jawaban"
          >
            <StopIcon size={18} />
          </button>
        ) : (
          <button
            className="composer__action"
            type="submit"
            disabled={value.trim() === ''}
            aria-label="Kirim pertanyaan"
            title="Kirim pertanyaan"
          >
            <SendIcon size={18} />
          </button>
        )}
      </div>

      <div className="composer__meta">
        <span className="composer__hint">
          <kbd>Enter</kbd> kirim · <kbd>Shift</kbd> + <kbd>Enter</kbd> baris baru
        </span>
        {value.length > 0 ? (
          <span
            className={`composer__counter${isNearLimit ? ' composer__counter--warn' : ''}`}
          >
            {value.length}/{MAX_QUESTION_LENGTH}
          </span>
        ) : null}
      </div>
    </form>
  );
}
