import useAbandonedCount from '@/hooks/useAbandonedCount';

/** Unread-style counter pill. Pass `count`, or omit it to self-fetch. */
export function CountBadge({ count, className = '' }) {
  if (!count) return null;
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-sm ring-2 ring-white ${className}`}
      aria-label={`${count} new abandoned orders`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function AbandonedBadge({ className }) {
  const count = useAbandonedCount();
  return <CountBadge count={count} className={className} />;
}
