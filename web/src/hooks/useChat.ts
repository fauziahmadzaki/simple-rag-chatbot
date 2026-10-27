import { useCallback, useEffect, useRef, useState } from 'react';
import { askQuestion, ChatApiError } from '../api/chat';
import type { ChatSource } from '../api/chat';

export type ChatRole = 'user' | 'assistant';
export type ChatMessageStatus = 'ok' | 'error' | 'cancelled';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  sources: ChatSource[];
  status: ChatMessageStatus;
}

let messageCounter = 0;

function createMessageId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

function createMessage(
  role: ChatRole,
  content: string,
  status: ChatMessageStatus = 'ok',
  sources: ChatSource[] = [],
): ChatMessage {
  return { id: createMessageId(), role, content, sources, status };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');

  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef(0);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const runRequest = useCallback(
    async (question: string, appendUserMessage: boolean) => {
      if (busyRef.current) {
        return;
      }

      busyRef.current = true;
      setIsLoading(true);
      setLastQuestion(question);

      const session = sessionRef.current;
      const controller = new AbortController();
      abortRef.current = controller;

      if (appendUserMessage) {
        setMessages((previous) => [
          ...previous,
          createMessage('user', question),
        ]);
      }

      try {
        const result = await askQuestion(question, controller.signal);
        if (session !== sessionRef.current) {
          return;
        }
        setMessages((previous) => [
          ...previous,
          createMessage('assistant', result.answer, 'ok', result.sources),
        ]);
      } catch (error) {
        if (session !== sessionRef.current) {
          return;
        }
        if (controller.signal.aborted && !(error instanceof ChatApiError)) {
          setMessages((previous) => [
            ...previous,
            createMessage('assistant', 'Permintaan dihentikan.', 'cancelled'),
          ]);
        } else {
          const message =
            error instanceof ChatApiError
              ? error.message
              : 'Terjadi kesalahan yang tidak terduga.';
          setMessages((previous) => [
            ...previous,
            createMessage('assistant', message, 'error'),
          ]);
        }
      } finally {
        busyRef.current = false;
        abortRef.current = null;
        setIsLoading(false);
      }
    },
    [],
  );

  const send = useCallback(
    (question: string) => {
      const trimmed = question.trim();
      if (trimmed === '') {
        return;
      }
      void runRequest(trimmed, true);
    },
    [runRequest],
  );

  const retry = useCallback(() => {
    if (lastQuestion === '') {
      return;
    }
    void runRequest(lastQuestion, false);
  }, [lastQuestion, runRequest]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    sessionRef.current += 1;
    abortRef.current?.abort();
    setMessages([]);
    setLastQuestion('');
  }, []);

  const lastAssistantMessage = messages.findLast(
    (message) => message.role === 'assistant',
  );

  return {
    messages,
    isLoading,
    lastQuestion,
    hasMessages: messages.length > 0,
    canRetry: lastAssistantMessage?.status === 'error' && lastQuestion !== '',
    send,
    retry,
    stop,
    clear,
  };
}
