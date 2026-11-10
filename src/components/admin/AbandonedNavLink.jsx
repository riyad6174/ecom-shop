import Link from 'next/link';
import AbandonedBadge, { CountBadge } from '@/components/admin/AbandonedBadge';

/**
 * "Abandoned" link for the top tab-style admin nav (orders, coupons, sms).
 * Pass `count` when the page already polls it; otherwise the badge self-fetches.
 */
export default function AbandonedNavLink({ active = false, count }) {
  return (
    <Link
      href='/admin/abandoned-orders'
      className={`text-sm px-4 py-1.5 rounded-md inline-flex items-center gap-1.5 transition-colors ${
        active
          ? 'bg-white shadow-sm font-semibold text-blue-700'
          : 'text-slate-600 hover:bg-slate-200 font-medium'
      }`}
    >
      Abandoned
      {count === undefined ? <AbandonedBadge /> : <CountBadge count={count} />}
    </Link>
  );
}
