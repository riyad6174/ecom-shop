import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiRefreshCw, FiArrowLeft, FiArrowRight,
  FiPhone, FiCopy, FiCheck, FiShoppingCart, FiClock, FiMessageCircle,
} from 'react-icons/fi';
import { ABANDONED_SEEN_EVENT } from '@/hooks/useAbandonedCount';
import FilterToolbar from '@/components/admin/orders/FilterToolbar';

const PAGE_SIZE = 30;

function localPhone(s) {
  return s.phoneLocal || String(s.phone || '').replace(/^\+?88/, '');
}

function formatDhaka(date) {
  if (!date) return { date: '—', time: '—' };
  const d = new Date(date);
  return {
    date: d.toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka', month: 'short', day: '2-digit', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit' }),
  };
}

function timeAgo(date) {
  if (!date) return '';
  const mins = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Stamp({ date, relative }) {
  const t = formatDhaka(date);
  return (
    <div className='flex flex-col'>
      <span className='text-xs font-bold text-slate-700 whitespace-nowrap mb-0.5'>{t.date}</span>
      <span className='text-[10px] text-slate-400 font-medium whitespace-nowrap'>
        {t.time}
        {relative && <span className='ml-1 text-slate-300'>· {timeAgo(date)}</span>}
      </span>
    </div>
  );
}

/**
 * Abandoned orders list. Used by /admin/abandoned-orders (markSeen = true,
 * which resets the "new" counter) and by the Abandoned tab on /admin/orders.
 */
export default function AbandonedOrdersTable({ markSeen = false }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ today: 0, total: 0, new: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [copied, setCopied] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const requestIdRef = useRef(0);

  const fetchRows = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE, search, from: fromDate, to: toDate });
      const res = await fetch(`/api/admin/abandoned-orders?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (requestId !== requestIdRef.current) return; // a newer request wins
      setRows(data.abandonedOrders || []);
      setHasLoaded(true);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setStats(data.stats || { today: 0, total: 0, new: 0 });

      // Admin is looking at this list → everything in it is no longer "new".
      // Rows keep their NEW highlight for this view (seenByAdmin came back false).
      if (markSeen && data.stats?.new > 0) {
        fetch('/api/admin/abandoned-orders/mark-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upTo: data.serverTime }),
        })
          .then(() => window.dispatchEvent(new Event(ABANDONED_SEEN_EVENT)))
          .catch(() => {});
      }
    } catch {
      // keep previous state
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, search, fromDate, toDate, markSeen]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    setPage(1);
  }, [search, fromDate, toDate]);

  const clearDates = () => {
    setFromDate('');
    setToDate('');
  };

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div>
      {/* ── Compact summary + reload ── */}
      <div className='flex flex-wrap items-center gap-x-5 gap-y-2 mb-4'>
        <div className='flex items-center gap-4 text-sm'>
          <span className='text-slate-500'>
            Today <b className='text-orange-600 tabular-nums'>{stats.today}</b>
          </span>
          <span className='text-slate-500'>
            Total <b className='text-slate-800 tabular-nums'>{stats.total}</b>
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              stats.new > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {stats.new} new
          </span>
        </div>
        <p className='hidden md:block text-[11px] text-slate-400'>
          Marked abandoned after 3–4 min without activity · placed orders never appear here
        </p>
        <button
          onClick={fetchRows}
          className='ml-auto flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 shadow-sm'
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Reload
        </button>
      </div>

      <FilterToolbar
        search={search}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder='Search name, phone, address or product…'
        from={fromDate}
        to={toDate}
        onDateChange={(f, t) => {
          setFromDate(f);
          setToDate(t);
        }}
        onClearAll={clearDates}
        resultText={
          hasLoaded
            ? total === 0
              ? 'No abandoned orders'
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
            : ''
        }
      />

      {/* ── Table ── */}
      <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]'>
        <div className='overflow-x-auto flex-grow'>
          <table className='w-full text-sm text-left border-collapse'>
            <thead>
              <tr className='bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-widest'>
                <th className='px-5 py-4'>Customer</th>
                <th className='px-5 py-4'>Product(s)</th>
                <th className='px-5 py-4 text-center'>Qty</th>
                <th className='px-5 py-4'>Delivery Address</th>
                <th className='px-5 py-4 text-right'>Order Details</th>
                <th className='px-5 py-4'>Abandoned At</th>
                <th className='px-5 py-4'>Last Activity</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 transition-opacity ${loading && hasLoaded ? 'opacity-50' : ''}`}>
              {loading && !hasLoaded ? (
                <tr>
                  <td colSpan='7' className='py-24 text-center'>
                    <div className='animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto' />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan='7' className='py-24 text-center'>
                    <FiShoppingCart className='w-10 h-10 text-slate-200 mx-auto mb-3' />
                    <p className='text-slate-500 font-bold'>No abandoned orders found</p>
                  </td>
                </tr>
              ) : (
                rows.map((s) => {
                  const phone = localPhone(s);
                  const qty = (s.items || []).reduce((n, it) => n + (Number(it.quantity) || 1), 0);
                  const isNew = !s.seenByAdmin;
                  return (
                    <tr
                      key={s._id}
                      className={`border-l-4 ${isNew ? 'border-red-400 bg-red-50/40' : 'border-transparent'} hover:bg-slate-50 transition-colors`}
                    >
                      {/* Customer */}
                      <td className='px-5 py-4 align-top'>
                        <div className='flex items-center gap-1.5 mb-0.5'>
                          <span className='font-bold text-slate-800 text-sm'>
                            {s.name || <span className='italic text-slate-400 font-medium'>No name</span>}
                          </span>
                          {isNew && (
                            <span className='text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500 text-white'>New</span>
                          )}
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <a href={`tel:${phone}`} className='text-sm font-mono font-semibold text-blue-700 hover:underline' title='Call'>
                            {phone}
                          </a>
                          <a href={`tel:${phone}`} className='p-1 rounded-md text-emerald-600 hover:bg-emerald-50' title='Call'>
                            <FiPhone className='w-3.5 h-3.5' />
                          </a>
                          <a
                            href={`https://wa.me/88${phone}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='p-1 rounded-md text-green-600 hover:bg-green-50'
                            title='WhatsApp'
                          >
                            <FiMessageCircle className='w-3.5 h-3.5' />
                          </a>
                          <button onClick={() => copy(phone, `p-${s._id}`)} className='p-1 rounded-md text-slate-400 hover:bg-slate-100' title='Copy phone'>
                            {copied === `p-${s._id}` ? <FiCheck className='w-3.5 h-3.5 text-emerald-600' /> : <FiCopy className='w-3.5 h-3.5' />}
                          </button>
                        </div>
                        {s.laterOrderId && (
                          <span
                            className='inline-block mt-1.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border bg-emerald-100 text-emerald-700 border-emerald-200'
                            title='This customer placed an order later from another checkout'
                          >
                            Ordered later #{s.laterOrderId}
                          </span>
                        )}
                      </td>

                      {/* Products */}
                      <td className='px-5 py-4 align-top text-[11px] leading-tight text-slate-700 max-w-[260px]'>
                        {(s.items || []).length === 0 ? (
                          <span className='italic text-slate-400'>—</span>
                        ) : (
                          s.items.map((it, i) => (
                            <div key={i} className='mb-1.5 last:mb-0'>
                              <span className='font-medium'>{it.title}</span>
                              {it.variant && it.variant !== 'Standard' && (
                                <span className='block text-[10px] text-gray-500 uppercase tracking-tight'>{it.variant}</span>
                              )}
                            </div>
                          ))
                        )}
                      </td>

                      {/* Quantity */}
                      <td className='px-5 py-4 align-top text-center'>
                        <span className='font-black text-blue-600'>{qty}</span>
                        {(s.items || []).length > 1 && (
                          <div className='text-[10px] text-slate-400 mt-1'>
                            {s.items.map((it) => it.quantity).join(' + ')}
                          </div>
                        )}
                      </td>

                      {/* Address */}
                      <td className='px-5 py-4 align-top max-w-[240px]'>
                        {s.deliveryZone && (
                          <span className='text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block border border-blue-100 mb-1'>
                            {s.deliveryZone}
                          </span>
                        )}
                        <p className='text-xs text-slate-600 leading-relaxed font-medium'>
                          {s.address || <span className='italic text-slate-400'>Not entered</span>}
                        </p>
                      </td>

                      {/* Order details */}
                      <td className='px-5 py-4 align-top text-right whitespace-nowrap'>
                        <div className='font-black text-slate-900 text-sm'>৳{Number(s.grandTotal || 0).toLocaleString('en-BD')}</div>
                        <div className='text-[10px] text-slate-400 font-medium'>
                          ৳{Number(s.totalPrice || 0).toLocaleString('en-BD')} + ৳{Number(s.shippingCharge || 0)} shipping
                        </div>
                        {s.couponCode && (
                          <span className='inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-purple-100 text-purple-800 border-purple-200'>
                            {s.couponCode}
                          </span>
                        )}
                        {(s.trafficSource || s.deviceType) && (
                          <div className='text-[10px] text-slate-400 mt-1 capitalize'>
                            {[s.trafficSource, s.deviceType].filter(Boolean).join(' · ')}
                          </div>
                        )}
                        {s.pageUrl && (
                          <a
                            href={s.pageUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='block text-[10px] text-blue-500 hover:underline truncate max-w-[180px] ml-auto'
                            title={s.pageUrl}
                          >
                            {s.pageUrl.replace(/^https?:\/\/[^/]+/, '').split('?')[0] || '/'}
                          </a>
                        )}
                      </td>

                      <td className='px-5 py-4 align-top'>
                        <Stamp date={s.abandonedAt} relative />
                      </td>
                      <td className='px-5 py-4 align-top'>
                        <Stamp date={s.lastActivityAt} />
                        <div className='flex items-center gap-1 text-[10px] text-slate-400 mt-1'>
                          <FiClock className='w-3 h-3' /> started {formatDhaka(s.createdAt).time}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className='px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='text-xs font-bold text-slate-500 uppercase tracking-widest bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm'>
              Page <span className='text-blue-600'>{page}</span> of {totalPages}
              <span className='ml-2 text-slate-400 normal-case font-medium'>({total} total)</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:pointer-events-none shadow-sm'
              >
                <FiArrowLeft className='w-5 h-5' />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className='h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:pointer-events-none shadow-sm'
              >
                <FiArrowRight className='w-5 h-5' />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
