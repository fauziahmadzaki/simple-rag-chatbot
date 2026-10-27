export interface ChatSource {
  id: number;
  text: string;
  score: number;
}

export interface ChatAnswer {
  answer: string;
  sources: ChatSource[];
}

export const MAX_QUESTION_LENGTH = 500;

const REQUEST_TIMEOUT_MS = 90_000;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export class ChatApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
  }
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const message = (payload as { error?: unknown }).error;
    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }
  }
  return fallback;
}

function parseSources(value: unknown): ChatSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const sources = new Map<number, ChatSource>();

  value.forEach((item) => {
    if (typeof item === 'string') {
      // Backend boleh hanya mengirim id, mis. "D3".
      const match = /^D?(\d+)$/i.exec(item.trim());
      if (match) {
        const id = Number(match[1]);
        sources.set(id, { id, text: '', score: 0 });
      }
      return;
    }

    if (!item || typeof item !== 'object') {
      return;
    }

    const record = item as Record<string, unknown>;
    const id = Number(record.id);
    const text = typeof record.text === 'string' ? record.text.trim() : '';
    const score = Number(record.score);

    if (!Number.isFinite(id) || (text === '' && !Number.isFinite(score))) {
      return;
    }

    sources.set(id, {
      id,
      text,
      score: Number.isFinite(score) ? score : 0,
    });
  });

  return [...sources.values()].sort((a, b) => a.id - b.id);
}

/**
 * Klien untuk endpoint RAG Flask (`POST /api/chat`).
 * Peran `api/chat.php` digantikan oleh proxy Vite (lihat `vite.config.ts`),
 * sehingga tidak ada masalah CORS saat development.
 */
export async function askQuestion(
  question: string,
  signal?: AbortSignal,
): Promise<ChatAnswer> {
  const trimmed = question.trim();

  if (trimmed === '') {
    throw new ChatApiError('Pertanyaan tidak boleh kosong.', 400);
  }

  if (trimmed.length > MAX_QUESTION_LENGTH) {
    throw new ChatApiError(
      `Pertanyaan maksimal ${MAX_QUESTION_LENGTH} karakter.`,
      400,
    );
  }

  const controller = new AbortController();
  let timedOut = false;

  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: trimmed }),
      signal: controller.signal,
    });

    const raw = await response.text();
    let payload: unknown = null;

    if (raw !== '') {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      throw new ChatApiError(
        readErrorMessage(
          payload,
          `Permintaan gagal (HTTP ${response.status}).`,
        ),
        response.status,
      );
    }

    if (!payload || typeof payload !== 'object') {
      throw new ChatApiError(
        'Respons server tidak dapat dibaca. Pastikan Flask mengembalikan JSON.',
        502,
      );
    }

    const answer = (payload as { answer?: unknown }).answer;

    if (typeof answer !== 'string' || answer.trim() === '') {
      throw new ChatApiError('Server tidak menghasilkan jawaban.', 502);
    }

    return {
      answer: answer.trim(),
      sources: parseSources((payload as { sources?: unknown }).sources),
    };
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }

    if (timedOut) {
      throw new ChatApiError(
        'Server tidak merespons dalam 90 detik. Silakan coba lagi.',
        0,
      );
    }

    if (signal?.aborted) {
      throw error;
    }

    throw new ChatApiError(
      'Tidak dapat terhubung ke Flask. Jalankan `python app.py` di 127.0.0.1:5000 lalu coba lagi.',
      0,
    );
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
