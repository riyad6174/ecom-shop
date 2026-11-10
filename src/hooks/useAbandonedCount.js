// Live count of new (unseen) abandoned orders for the admin navigation.
// Polls the server, so it stays in sync across refreshes, tabs and admins.
import { useEffect, useState } from 'react';

const POLL_MS = 30 * 1000;
export const ABANDONED_SEEN_EVENT = 'abandoned-orders-seen';

export default function useAbandonedCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const res = await fetch('/api/admin/abandoned-orders/count', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCount(Number(data.count) || 0);
      } catch {
        // keep the last known value
      }
    };
    const onSeen = () => load();

    load();
    const id = setInterval(load, POLL_MS);
    window.addEventListener('focus', load);
    window.addEventListener(ABANDONED_SEEN_EVENT, onSeen);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener('focus', load);
      window.removeEventListener(ABANDONED_SEEN_EVENT, onSeen);
    };
  }, []);

  return count;
}
