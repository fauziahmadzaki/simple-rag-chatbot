import { useEffect, useState } from 'react';
import { apiUrl } from '../api/chat';

export type BackendStatus = 'checking' | 'online' | 'offline';

const CHECK_INTERVAL_MS = 30_000;
const CHECK_TIMEOUT_MS = 4_000;

export function useBackendHealth(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>('checking');

  useEffect(() => {
    let active = true;

    const check = async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(
        () => controller.abort(),
        CHECK_TIMEOUT_MS,
      );

      try {
        const response = await fetch(apiUrl('/api/health'), {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (active) {
          setStatus(response.ok ? 'online' : 'offline');
        }
      } catch {
        if (active) {
          setStatus('offline');
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };

    void check();

    const interval = window.setInterval(() => {
      void check();
    }, CHECK_INTERVAL_MS);

    const handleFocus = () => {
      void check();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return status;
}
